package com.project.API.order;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
 import com.project.API.cart.Cart;
import com.project.API.cart.CartItem;
import com.project.API.cart.CartItemStatus;
import com.project.API.cart.CartRepository;
import com.project.API.config.ResourceNotFoundException;
import com.project.API.order.DTO.OrderResponse;
import com.project.API.product.ProductRepository;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Service
public class OrderServiceImp implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderServiceImp(OrderRepository orderRepository, CartRepository cartRepository, ProductRepository productRepository){
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }


    public String checkout(Long userId) throws MPException, MPApiException {
        Cart cart = cartRepository.findByUserIdAndStatus(userId, CartItemStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

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
        order.setTotal(
                cartItems.stream()
                        .map(i -> i.getProduct().getFinalPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

       return orderRepository.save(order);
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
                 .success("http://localhost:3000/orders/success")
                 .failure("http://localhost:3000/orders/failure")
                 .pending("http://localhost:3000/orders/pending")
                 .build();

         PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                 .items(items)
                 .backUrls(backUrls)
//                 .autoReturn("approved")
                 .notificationUrl("https://6da7-187-32-129-217.ngrok-free.app/order/webhook") // ← add this
                 .externalReference(order.getId().toString())
                 .build();

         PreferenceClient client = new PreferenceClient();

        try {
            Preference preference = client.create(preferenceRequest);
            order.setMercadoPagoPreferenceId(preference.getId());




            cart.setStatus(CartItemStatus.CHECKOUT);


            return preference.getInitPoint();

        } catch (MPApiException e) {

            cart.setStatus(CartItemStatus.CHECKOUT);
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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estoque insuficiente: apenas " + stock + " disponíveis");        }
    }

    @Override
    public void processPayment(String paymentId)throws MPException, MPApiException{
        PaymentClient paymentClient = new PaymentClient();
        Payment payment = paymentClient.get(Long.parseLong(paymentId));

        String orderId = payment.getExternalReference();
        String status = payment.getStatus();

        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new RuntimeException("Order not found"));

    switch (status) {
        case "approved" -> {
            order.setStatus(OrderStatus.PAID);
            order.setMercadoPagoPaymentId(paymentId);
            order.setPaidAt(LocalDateTime.now());
        }
        case "rejected" -> order.setStatus(OrderStatus.CANCELLED);
        case "pending" -> order.setStatus(OrderStatus.PENDING);
    }

    orderRepository.save(order);


    }

@Override
    public Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(OrderResponse::fromEntity);
    }




}
