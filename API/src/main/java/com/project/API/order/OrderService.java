package com.project.API.order;


import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;



public interface OrderService {
    Order createOrder(Long userid);
    String createChekout(Long orderId, Long userId)throws MPException, MPApiException;
    void processPayment(String paymentId)throws MPException, MPApiException;
}
