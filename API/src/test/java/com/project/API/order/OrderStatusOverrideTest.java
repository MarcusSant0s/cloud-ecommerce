package com.project.API.order;

import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.commom.exception.ResourceNotFoundException;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * O override de status do painel admin (PATCH /order/{id}/status).
 *
 * Ele trocava só o campo `status`, deixando `paidAt` para trás: um pedido devolvido
 * de PAID para PENDING ficava "aguardando pagamento" com data de pagamento
 * preenchida, e essa data aparece na tela de detalhes do pedido do cliente.
 */
class OrderStatusOverrideTest {

    private OrderRepository orderRepository;
    private OrderServiceImp orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        orderService = new OrderServiceImp(
                orderRepository,
                Mockito.mock(CartRepository.class),
                Mockito.mock(ProductRepository.class),
                Mockito.mock(ShippingService.class),
                Mockito.mock(CartService.class),
                Mockito.mock(PaymentResultHandler.class));

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Order orderWith(OrderStatus status, LocalDateTime paidAt) {
        Order order = OrderFactory.orderWithItems(
                OrderFactory.mockUser(1L), status, OrderFactory.singleItem(10L, 1));
        order.setPaidAt(paidAt);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        return order;
    }

    @Test
    @DisplayName("marcar como pago carimba a data quando ela ainda não existe")
    void shouldStampPaidAtWhenMarkingPaid() {
        orderWith(OrderStatus.PENDING, null);

        Order result = orderService.changeOrderStatus(1L, OrderStatus.PAID);

        assertEquals(OrderStatus.PAID, result.getStatus());
        assertNotNull(result.getPaidAt());
    }

    @Test
    @DisplayName("remarcar como pago preserva a data original do pagamento")
    void shouldKeepTheOriginalPaidAt() {
        LocalDateTime paidAt = LocalDateTime.now().minusDays(3);
        orderWith(OrderStatus.PAID, paidAt);

        Order result = orderService.changeOrderStatus(1L, OrderStatus.PAID);

        assertEquals(paidAt, result.getPaidAt(), "não deve reescrever quando já foi pago");
    }

    @Test
    @DisplayName("voltar para pendente limpa a data de pagamento")
    void shouldClearPaidAtWhenBackToPending() {
        orderWith(OrderStatus.PAID, LocalDateTime.now().minusDays(1));

        Order result = orderService.changeOrderStatus(1L, OrderStatus.PENDING);

        assertNull(result.getPaidAt(), "pedido em aberto não pode ter data de pagamento");
    }

    @Test
    @DisplayName("cancelar limpa a data de pagamento")
    void shouldClearPaidAtWhenCancelling() {
        orderWith(OrderStatus.PAID, LocalDateTime.now().minusDays(1));

        assertNull(orderService.changeOrderStatus(1L, OrderStatus.CANCELLED).getPaidAt());
    }

    @Test
    @DisplayName("reembolso preserva a data: o pedido foi pago de verdade antes de voltar")
    void shouldKeepPaidAtOnRefund() {
        LocalDateTime paidAt = LocalDateTime.now().minusDays(5);
        orderWith(OrderStatus.PAID, paidAt);

        Order result = orderService.changeOrderStatus(1L, OrderStatus.REFUNDED);

        assertEquals(OrderStatus.REFUNDED, result.getStatus());
        assertEquals(paidAt, result.getPaidAt());
    }

    @Test
    @DisplayName("pedido inexistente responde 404")
    void shouldFailForAnUnknownOrder() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.changeOrderStatus(99L, OrderStatus.PAID));
    }
}
