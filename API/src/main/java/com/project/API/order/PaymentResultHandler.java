package com.project.API.order;

import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.CartStatus;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.product.ProductRepository;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Aplica o resultado de um pagamento ao pedido, dentro de uma transação.
 *
 * Vive em um bean separado de propósito. @Transactional só vale quando a chamada
 * passa pelo proxy do Spring, e OrderServiceImp.processPayment() chamava este
 * método em `this` — auto-invocação nunca toca o proxy, então não havia transação
 * aberta e decrementStock(), que é uma query @Modifying, morria com
 * "No active transaction for update or delete query". O pedido ficava PENDING
 * porque a exceção estourava antes do save().
 *
 * Manter isto aqui também deixa a chamada HTTP ao Mercado Pago fora da transação:
 * quem busca o pagamento é o OrderServiceImp, sem segurar conexão do pool durante
 * a ida à rede.
 */
@Service
public class PaymentResultHandler {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    public PaymentResultHandler(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            CartService cartService
    ) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
    }

    @Transactional
    public void handlePaymentResult(String orderId, String mpStatus, String mpPaymentId) {
        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        switch (mpStatus) {
            case "approved" -> {
                order.setStatus(OrderStatus.PAID);
                order.setMercadoPagoPaymentId(mpPaymentId);
                order.setPaidAt(LocalDateTime.now());
                order.getItems().stream()
                        .filter(item -> item.getQuantity() > 0)
                        .forEach(item ->
                                productRepository.decrementStock(item.getProductId(), item.getQuantity()));
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartRepository::delete);
            }
            case "rejected" -> {
                order.setStatus(OrderStatus.CANCELLED);
                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartService::restoreToActive);
            }
            case "pending" -> order.setStatus(OrderStatus.PENDING);
        }

        orderRepository.save(order);
    }
}
