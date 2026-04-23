package com.project.API.order;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Map<String, String>> createOrder(
            @PathVariable Long userId
    ) throws MPException, MPApiException {

        Order order = orderService.createOrder(userId);

        if (order.getMercadoPagoPreferenceId() != null) {
            return ResponseEntity.ok(Map.of("checkoutUrl",
                    "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id="
                            + order.getMercadoPagoPreferenceId()));
        }

        String checkoutUrl = orderService.createChekout(order.getId(), userId);

        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
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
