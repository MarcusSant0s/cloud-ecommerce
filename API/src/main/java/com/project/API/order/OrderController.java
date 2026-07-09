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
    private final MercadoPagoWebhookValidator webhookValidator;

    public OrderController(OrderService orderService, MercadoPagoWebhookValidator webhookValidator){
        this.orderService = orderService;
        this.webhookValidator = webhookValidator;
    }


    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(
            @AuthenticationPrincipal User user
    ) throws MPException, MPApiException {

        String checkoutUrl = orderService.checkout(user.getId());
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
    }

    @PostMapping("/{orderId}/pay")
    public ResponseEntity<Map<String, String>> repay(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId
    ) throws MPException, MPApiException {

        String checkoutUrl = orderService.repayOrder(user.getId(), orderId);
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
    public ResponseEntity<Void> webhook(
            @RequestBody Map<String, Object> payload,
            @RequestParam(name = "data.id", required = false) String dataIdParam,
            @RequestHeader(name = "x-signature", required = false) String signature,
            @RequestHeader(name = "x-request-id", required = false) String requestId
    ) throws MPException, MPApiException {

        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        String bodyPaymentId = (data != null && data.get("id") != null)
                ? data.get("id").toString()
                : null;

        // MP signs the `data.id` query parameter; fall back to the body id if absent.
        String signedId = (dataIdParam != null && !dataIdParam.isBlank()) ? dataIdParam : bodyPaymentId;
        webhookValidator.validate(signature, requestId, signedId);

        String topic = (String) payload.get("type");
        if(!"payment".equals(topic)) {
            return ResponseEntity.ok().build();
        }

        orderService.processPayment(bodyPaymentId);

        return ResponseEntity.ok().build();
    }



}
