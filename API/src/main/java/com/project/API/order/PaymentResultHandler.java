package com.project.API.order;

import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.CartStatus;
import com.project.API.commom.exception.ResourceNotFoundException;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    private static final Logger log = LoggerFactory.getLogger(PaymentResultHandler.class);

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final StockReservation stockReservation;

    public PaymentResultHandler(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartService cartService,
            StockReservation stockReservation
    ) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.stockReservation = stockReservation;
    }

    @Transactional
    public void handlePaymentResult(String orderId, String mpStatus, String mpPaymentId) {
        Order order = orderRepository.findByIdForUpdate(Long.parseLong(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if(order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.REFUNDED ||
        order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED){
            log.info("Pedido {} já resolvido ({}), notificação '{}' ignorada", orderId, order.getStatus(), mpStatus);
        return ;
        }

        switch (mpStatus) {

            case "delivered", "paid", "shiped" -> {}
            case "approved" -> {
                order.setStatus(OrderStatus.PAID);
                order.setMercadoPagoPaymentId(mpPaymentId);
                order.setPaidAt(LocalDateTime.now());
                // O estoque já saiu na criação do pedido. Só pedido sem reserva (anterior a
                // ela, ou cancelado e pago mesmo assim) baixa aqui — e loga o que faltar.
                stockReservation.reserveForPaidOrder(order);

                cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                        .ifPresent(cartRepository::delete);

            }
            case "rejected" -> {
               /*
               * A rejected attempt should not be deletted
               * user can use another payment method and if the user
               * give up, the cleanerSchedule wiil take care or the own
               * user can /cancel the order
               * */

            }
            case "pending" -> {
                if (order.getStatus() == OrderStatus.PENDING)
                    order.setStatus(OrderStatus.PENDING);
            }
        }

        orderRepository.save(order);
    }
}
