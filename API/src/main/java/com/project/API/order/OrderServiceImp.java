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
import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.commom.exception.CartInconsistencyException;
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

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ShippingService shippingService;

    @Value("${mercadopago.notification.url}")
    private String notificationUrl;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public OrderServiceImp(OrderRepository orderRepository, CartRepository cartRepository, ProductRepository productRepository, ShippingService shippingService){
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.shippingService = shippingService;
    }


    public String checkout(Long userId) throws MPException, MPApiException {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));


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

        if (order.getMercadoPagoPreferenceId() != null) {
            return "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id="
                    + order.getMercadoPagoPreferenceId();
        }

        return createCheckout(order, cart);
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
            validateStockAvailability(cartItem.getProduct().getId(), cartItem.getQuantity());

            OrderItem orderItem = new OrderItem(
                    cartItem.getProduct().getId(),
                    cartItem.getProduct().getName(),
                    cartItem.getProduct().getFinalPrice(),
                    cartItem.getQuantity(),
                    cartItem.getProduct().getMainImage().getUrl(),
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




            cart.setStatus(CartStatus.CHECKOUT);


            return preference.getInitPoint();

        } catch (MPApiException e) {

            cart.setStatus(CartStatus.ACTIVE);
            orderRepository.delete(order);
            System.out.println("Status: " + e.getStatusCode());
            System.out.println("Response: " + e.getApiResponse().getContent());
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
                order.getItems().forEach(item ->
                        productRepository.decrementStock(item.getProductId(), item.getQuantity())
                );
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartRepository::delete);
            }
            case "rejected" -> {
                order.setStatus(OrderStatus.CANCELLED);
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cart -> {
                            cart.setStatus(CartStatus.ACTIVE);
                            cartRepository.save(cart);
                        });
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
