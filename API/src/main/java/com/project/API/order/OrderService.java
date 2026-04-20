package com.project.API.order;


import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;

import java.util.List;

public interface OrderService {
    Order createOrder(Long userid);
    String createChekout(Long orderId)throws MPException, MPApiException;
}
