package com.project.API.order;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.project.API.order.DTO.OrderResponse;
import com.project.API.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService){
        this.orderService = orderService;
    }


    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, String>> checkout(
            @PathVariable Long userId
    ) throws MPException, MPApiException {

        String checkoutUrl = orderService.checkout(userId);
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @GetMapping()
    public Page<OrderResponse> getOrders(
            @AuthenticationPrincipal User user,
            Pageable pageable
    ) {
        return orderService.getOrdersByUser(user.getId(), pageable);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload)
            throws MPException, MPApiException {
        String topic = (String) payload.get("type");

        if(!"payment".equals(topic)) {
            return ResponseEntity.ok().build();
        }

        String paymentId = payload.get("data.id").toString();
        orderService.processPayment(paymentId);

        return ResponseEntity.ok().build();
    }
}
