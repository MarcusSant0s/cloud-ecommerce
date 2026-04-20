package com.project.API.order;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService){
        this.orderService = orderService;
    }


    public ResponseEntity<Map<String, String>> createOrder( @RequestParam Long userId)
            throws MPException, MPApiException {

        Order order = orderService.createOrder(userId);
        String checkoutUrl = orderService.createChekout(order.getId());

        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }
}
