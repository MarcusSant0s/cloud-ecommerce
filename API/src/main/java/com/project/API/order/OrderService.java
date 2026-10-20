package com.project.API.order;


import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.project.API.cart.Cart;
import com.project.API.order.DTO.AdminOrderAttentionResponse;
import com.project.API.order.DTO.AdminOrderResponse;
import com.project.API.order.DTO.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface OrderService {

     Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable);

     OrderResponse getOrderForUser(Long userId, Long orderId);

     Page<AdminOrderResponse> getAllOrders(Pageable pageable);

     String checkout(Long userId) throws MPException, MPApiException;

     String repayOrder(Long userId, Long orderId) throws MPException, MPApiException;

     void cancelOrder(Long userId, Long orderId);


    Order createOrder(Long userId, Cart cart);

    String createCheckout(Order order, Cart cart) throws MPException, MPApiException;

    void processPayment(String paymentId)throws MPException, MPApiException;

    Order changeOrderStatus(Long orderId, OrderStatus orderStatus);

    AdminOrderResponse shipOrder(Long orderId, String trackingCode);

    AdminOrderAttentionResponse getAttentionOverview();
}
