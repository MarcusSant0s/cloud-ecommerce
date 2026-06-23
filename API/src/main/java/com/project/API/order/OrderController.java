package com.project.API.order;

import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.project.API.order.DTO.AdminOrderResponse;
import com.project.API.order.DTO.OrderResponse;
import com.project.API.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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


    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(
            @AuthenticationPrincipal User user
    ) throws MPException, MPApiException {

        String checkoutUrl = orderService.checkout(user.getId());
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderStatus> changeOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus orderStatus
    ){
      Order order = orderService.changeOrderStatus(orderId, orderStatus);
      return ResponseEntity.ok(order.getStatus());
    }

    @GetMapping
    public Page<OrderResponse> getOrders(
            @AuthenticationPrincipal User user,
            Pageable pageable
    ) {
        return orderService.getOrdersByUser(user.getId(), pageable);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AdminOrderResponse> getAllOrders(Pageable pageable) {
        return orderService.getAllOrders(pageable);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody Map<String, Object> payload)
            throws MPException, MPApiException {
        String topic = (String) payload.get("type");

        if(!"payment".equals(topic)) {
            return ResponseEntity.ok().build();
        }

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        String paymentId = data.get("id").toString();
        orderService.processPayment(paymentId);

        return ResponseEntity.ok().build();
    }



}
