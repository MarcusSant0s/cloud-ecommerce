package com.project.API.order;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferenceShipmentsRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
 import com.project.API.cart.Cart;
import com.project.API.cart.CartItem;
import com.project.API.cart.CartStatus;
import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.commom.exception.CartInconsistencyException;
import com.project.API.commom.exception.OrderNotPayableException;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.commom.exception.ShippingAddressRequiredException;
import com.project.API.order.DTO.AdminOrderResponse;
import com.project.API.order.DTO.MissingProducts;
import com.project.API.order.DTO.OrderResponse;
import com.project.API.order.interfaces.QuantityChecks;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import com.project.API.user.UserAdress;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class OrderServiceImp implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImp.class);

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ShippingService shippingService;
    private final CartService cartService;

    @Value("${mercadopago.notification.url}")
    private String notificationUrl;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // Portfolio/demo deploys have no real payment provider — when true, checkout
    // skips Mercado Pago and simulates an approved payment.
    @Value("${app.payments.demo-mode:false}")
    private boolean paymentsDemoMode;

    public OrderServiceImp(OrderRepository orderRepository, CartRepository cartRepository, ProductRepository productRepository, ShippingService shippingService, CartService cartService){
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.shippingService = shippingService;
        this.cartService = cartService;
    }


    @Transactional
    public String checkout(Long userId) throws MPException, MPApiException {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));


        boolean hasNonPositiveQuantity = cart.getCartItem().stream()
                .anyMatch(cartItem -> cartItem.getQuantity() <= 0);
        if (hasNonPositiveQuantity) {
            throw new IllegalArgumentException("Carrinho contém item com quantidade inválida");
        }

        //cart
        Map<Long, Integer> requestedMap = cart.getCartItem().stream()
                .collect(Collectors.toMap(
                        cartItem -> cartItem.getProduct().getId(),
                        CartItem::getQuantity
                ));

        // stock
         List<Long> ids = new ArrayList<>(requestedMap.keySet());

        List<QuantityChecks> stocks = productRepository.findAllByIdIn(ids);


        List<MissingProducts> missingProducts = stocks
                .stream()
                .filter(stock ->
                        stock.getQuantity() <
                        requestedMap.getOrDefault(stock.getId(), 0))
                .map(item -> new MissingProducts(item.getId(), item.getQuantity()))
                .toList();

        if (!missingProducts.isEmpty()){
           throw new CartInconsistencyException("Some quantity of products does not match with stock.", missingProducts);

        }

        Order order = createOrder(userId, cart);

        if (paymentsDemoMode) {
            return completeDemoCheckout(order, cart);
        }

        if (order.getMercadoPagoPreferenceId() != null) {
            return resolveCheckoutUrl(order, cart);
        }

        return createCheckout(order, cart);
    }

    /**
     * Re-opens payment for an existing PENDING order. Unlike {@link #checkout},
     * this does not require an ACTIVE cart — a pending order already moved its
     * cart to CHECKOUT — so it lets the user finish paying an order they
     * abandoned at the Mercado Pago step.
     */
    @Transactional
    @Override
    public String repayOrder(Long userId, Long orderId) throws MPException, MPApiException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Don't leak the existence of other users' orders.
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new OrderNotPayableException("Somente pedidos pendentes podem ser pagos.");
        }

        // A pending order already moved its cart to CHECKOUT. It can be missing
        // entirely (the user emptied it), which every path below tolerates.
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.CHECKOUT).orElse(null);

        if (paymentsDemoMode) {
            return completeDemoCheckout(order, cart);
        }

        if (order.getMercadoPagoPreferenceId() != null) {
            return resolveCheckoutUrl(order, cart);
        }

        // No preference yet (checkout was interrupted before Mercado Pago responded):
        // build one now.
        return createCheckout(order, cart);
    }

    /**
     * Returns the Mercado Pago checkout link for an order that already has a
     * preference.
     *
     * <p>The link has to come from MP's own {@code init_point}: a hand-built
     * sandbox URL only ever works under test credentials, so with a production
     * access token it sends the buyer to a checkout that cannot find the
     * preference. Reading the preference back also keeps working if MP changes
     * the redirect host.
     *
     * <p>A preference MP no longer recognises — created under different
     * credentials, or expired — is discarded and rebuilt rather than handed to
     * the buyer as a dead link.
     */
    private String resolveCheckoutUrl(Order order, Cart cart) throws MPException, MPApiException {
        String preferenceId = order.getMercadoPagoPreferenceId();

        try {
            String initPoint = new PreferenceClient().get(preferenceId).getInitPoint();
            if (initPoint != null && !initPoint.isBlank()) {
                return initPoint;
            }
            log.warn("Mercado Pago returned preference {} without an init_point for order {}; rebuilding it",
                    preferenceId, order.getId());
        } catch (MPApiException e) {
            log.warn("Mercado Pago rejected a lookup of preference {} for order {} (HTTP {}); rebuilding it",
                    preferenceId, order.getId(), e.getStatusCode());
        }

        order.setMercadoPagoPreferenceId(null);
        return createCheckout(order, cart);
    }

    /**
     * Simulates an approved payment for demo deploys: marks the order PAID,
     * decrements stock and clears the cart — the same effect the Mercado Pago
     * "approved" webhook would have — then sends the user to the success page.
     */
    private String completeDemoCheckout(Order order, Cart cart) {
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setMercadoPagoPreferenceId("demo-pref-" + order.getId());
        order.setMercadoPagoPaymentId("demo-pay-" + order.getId());
        order.getItems().stream()
                .filter(item -> item.getQuantity() > 0)
                .forEach(item ->
                        productRepository.decrementStock(item.getProductId(), item.getQuantity()));
        orderRepository.save(order);

        if (cart != null) {
            cartRepository.delete(cart);
        }

        return frontendUrl + "/orders/success?external_reference=" + order.getId();
    }


    @Transactional
    @Override
    public Order createOrder(Long userId, Cart cart) {


        Optional<Order> pendingOrder = orderRepository.findByUserIdAndStatus(userId, OrderStatus.PENDING);
        if (pendingOrder.isPresent()){
            return pendingOrder.get();
        }
        List<CartItem> cartItems = cart.getCartItem();

        Order order = new Order();

        for(CartItem cartItem : cartItems){
            // A non-positive quantity passes validateStockAvailability (stock < -3 is
            // false) and then multiplies into a negative subtotal, so it has to be
            // rejected on its own terms.
            if (cartItem.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Quantidade inválida no carrinho para o produto " + cartItem.getProduct().getId());
            }
            validateStockAvailability(cartItem.getProduct().getId(), cartItem.getQuantity());

            OrderItem orderItem = new OrderItem(
                    cartItem.getProduct().getId(),
                    cartItem.getProduct().getName(),
                    cartItem.getProduct().getFinalPrice(),
                    cartItem.getQuantity(),
                    cartItem.getProduct().getMainImage() != null
                            ? cartItem.getProduct().getMainImage().getUrl()
                            : "",
                    cartItem.getProduct().getDescription()
            );

            order.addItem(orderItem);
        }

        order.setStatus(OrderStatus.PENDING);
        order.setUser(cart.getUser());

        BigDecimal subtotal = cartItems.stream()
                .map(i -> i.getProduct().getFinalPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingCost = resolveShippingCost(cart.getUser());
        order.setShippingCost(shippingCost);
        order.setTotal(subtotal.add(shippingCost));

       return orderRepository.save(order);
    }

    private BigDecimal resolveShippingCost(User user) {
        UserAdress address = user == null ? null : user.getUserAdress();
        if (address == null || address.getCep() == null || address.getCep().isBlank()) {
            throw new ShippingAddressRequiredException(
                    "Cadastre um endereço de entrega antes de finalizar a compra.");
        }
        return shippingService.calculate(address.getCep());
    }


    @Transactional
    @Override
    public String createCheckout(Order order, Cart cart) throws MPException, MPApiException {

         List<PreferenceItemRequest> items = order.getItems().stream()
                 .map(item -> PreferenceItemRequest.builder()
                         .id(item.getProductId().toString())
                         .title(item.getProductName())
                         .description(item.getDescription())
                         .pictureUrl(item.getUrl())
                         .quantity(item.getQuantity())
                         .currencyId("BRL")
                         .unitPrice(item.getUnitPrice())
                         .build()
                 ).toList();

         PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                 .success(frontendUrl + "/orders/success")
                 .failure(frontendUrl + "/orders/failed")
                 .pending(frontendUrl + "/orders/pending")
                 .build();

         BigDecimal shippingCost = order.getShippingCost() == null ? BigDecimal.ZERO : order.getShippingCost();
         PreferenceShipmentsRequest shipments = PreferenceShipmentsRequest.builder()
                 .cost(shippingCost)
                 .mode("not_specified")
                 .build();

         PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                 .items(items)
                 .backUrls(backUrls)
                 .autoReturn("approved")
                 .shipments(shipments)
                 .notificationUrl(notificationUrl)
                 .externalReference(order.getId().toString())
                 .build();

         PreferenceClient client = new PreferenceClient();

        try {
            Preference preference = client.create(preferenceRequest);
            order.setMercadoPagoPreferenceId(preference.getId());


            if (cart != null) {
                cart.setStatus(CartStatus.CHECKOUT);
            }


            return preference.getInitPoint();

        } catch (MPApiException e) {

            if (cart != null) {
                // repayOrder hands us a cart that was already CHECKOUT, and MPApiException
                // is checked — jakarta's @Transactional does not roll back on it — so this
                // revert really does commit and has to go through the same reconciliation.
                cartService.restoreToActive(cart);
            }
            orderRepository.delete(order);
            log.error("Mercado Pago rejected the preference for order {} (HTTP {})",
                    order.getId(), e.getStatusCode(), e);
            throw e;


        }


    }




    private void validateStockAvailability(Long productId, int requestedQuantity) {
        int stock = productRepository.findQuantityById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (stock < requestedQuantity){
            throw new InsufficientStockException("Estoque insuficiente: apenas " + stock + " disponíveis");
        }
    }

    @Override
    public void processPayment(String paymentId) throws MPException, MPApiException {
        PaymentClient paymentClient = new PaymentClient();
        Payment payment = paymentClient.get(Long.parseLong(paymentId));
        handlePaymentResult(payment.getExternalReference(), payment.getStatus(), paymentId);
    }

    @Transactional
    void handlePaymentResult(String orderId, String mpStatus, String mpPaymentId) {
        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        switch (mpStatus) {
            case "approved" -> {
                order.setStatus(OrderStatus.PAID);
                order.setMercadoPagoPaymentId(mpPaymentId);
                order.setPaidAt(LocalDateTime.now());
                order.getItems().stream()
                        .filter(item -> item.getQuantity() > 0)
                        .forEach(item ->
                                productRepository.decrementStock(item.getProductId(), item.getQuantity()));
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartRepository::delete);
            }
            case "rejected" -> {
                order.setStatus(OrderStatus.CANCELLED);
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartService::restoreToActive);
            }
            case "pending" -> order.setStatus(OrderStatus.PENDING);
        }

        orderRepository.save(order);
    }

@Override
    public Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(OrderResponse::fromEntity);
    }

    @Override
    public Page<AdminOrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(AdminOrderResponse::fromEntity);
    }


    @Override
    public Order changeOrderStatus(Long orderId, OrderStatus orderStatus){

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(orderStatus);
        return  orderRepository.save(order);
    }


}
