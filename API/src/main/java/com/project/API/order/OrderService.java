package com.project.API.order;


import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.project.API.cart.Cart;
import com.project.API.order.DTO.OrderResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface OrderService {

     Page<OrderResponse> getOrdersByUser(Long userId, Pageable pageable);

     String checkout(Long userId) throws MPException, MPApiException;

    @Transactional
    Order createOrder(Long userId, Cart cart);

    @Transactional
    String createCheckout(Order order, Cart cart) throws MPException, MPApiException;

    void processPayment(String paymentId)throws MPException, MPApiException;

    Order changeOrderStatus(Long orderId, OrderStatus orderStatus);
}
