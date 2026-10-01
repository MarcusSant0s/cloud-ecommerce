package com.project.API.order;

import com.project.API.cart.Cart;
import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.CartStatus;
import com.project.API.product.ProductRepository;
import com.project.API.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * O webhook do Mercado Pago chega repetido e fora de ordem: payment.created e
 * payment.updated para o mesmo pagamento, reenvio quando a resposta demora, e uma
 * tentativa recusada seguida de outra aprovada no mesmo pedido. Aplicar a mesma
 * notificação duas vezes tem que deixar o pedido, o estoque e o carrinho como se
 * ela tivesse chegado uma vez só.
 */
class PaymentIdempotencyTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private CartService cartService;
    private PaymentResultHandler handler;

    private User user;
    private Cart checkoutCart;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        cartService = Mockito.mock(CartService.class);
        handler = new PaymentResultHandler(orderRepository, cartRepository, cartService, new StockReservation(productRepository));

        user = OrderFactory.mockUser(1L);
        checkoutCart = OrderFactory.mockCart(2L, user, CartStatus.CHECKOUT, List.of());
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.of(checkoutCart));
        when(productRepository.decrementStock(anyLong(), anyInt())).thenReturn(1);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Order order(OrderStatus status) {
        Order order = OrderFactory.orderWithItems(user, status, OrderFactory.singleItem(10L, 3));
        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));
        return order;
    }

    // ── segunda tentativa de pagamento ───────────────────────────────────────

    @Test
    @DisplayName("cartão recusado e depois outro aprovado: pedido pago, carrinho apagado, estoque baixado uma vez")
    void rejectedThenApproved_shouldEndPaidAsIfOnlyTheApprovalHadArrived() {
        Order order = order(OrderStatus.PENDING);

        handler.handlePaymentResult("1", "rejected", "mp_pay_card_1");
        handler.handlePaymentResult("1", "approved", "mp_pay_card_2");

        assertEquals(OrderStatus.PAID, order.getStatus());
        assertEquals("mp_pay_card_2", order.getMercadoPagoPaymentId());
        assertNotNull(order.getPaidAt());
        verify(productRepository, times(1)).decrementStock(10L, 3);
        // O carrinho fica em CHECKOUT durante a recusa e só é apagado na aprovação.
        // Se a recusa o devolvesse para ACTIVE, o cliente pagaria e continuaria
        // vendo os itens no carrinho.
        verify(cartService, never()).restoreToActive(any());
        verify(cartRepository, times(1)).delete(checkoutCart);
        verify(orderRepository, never()).delete(any(Order.class));
    }

    @Test
    @DisplayName("várias recusas seguidas não encerram o pedido")
    void repeatedRejections_shouldKeepTheOrderPayable() {
        Order order = order(OrderStatus.PENDING);

        handler.handlePaymentResult("1", "rejected", "mp_pay_card_1");
        handler.handlePaymentResult("1", "rejected", "mp_pay_card_2");

        assertEquals(OrderStatus.PENDING, order.getStatus());
        verify(cartService, never()).restoreToActive(any());
        verify(orderRepository, never()).delete(any(Order.class));
    }

    // ── notificação repetida ─────────────────────────────────────────────────

    @Test
    @DisplayName("approved repetido (payment.created + payment.updated) baixa o estoque uma vez só")
    void duplicateApproval_shouldDecrementStockOnce() {
        Order order = order(OrderStatus.PENDING);

        handler.handlePaymentResult("1", "approved", "mp_pay_1");
        LocalDateTime firstPaidAt = order.getPaidAt();
        handler.handlePaymentResult("1", "approved", "mp_pay_1");

        assertEquals(OrderStatus.PAID, order.getStatus());
        assertEquals(firstPaidAt, order.getPaidAt(), "a segunda notificação não reescreve a data do pagamento");
        verify(productRepository, times(1)).decrementStock(10L, 3);
        verify(cartRepository, times(1)).delete(checkoutCart);
    }

    // ── pedido que já passou do pagamento ────────────────────────────────────

    @ParameterizedTest(name = "approved atrasado não mexe num pedido {0}")
    @EnumSource(value = OrderStatus.class, names = {"PAID", "SHIPPED", "DELIVERED", "REFUNDED"})
    void lateApproval_shouldNotTouchASettledOrder(OrderStatus settled) {
        Order order = order(settled);
        LocalDateTime paidAt = LocalDateTime.now().minusDays(3);
        order.setPaidAt(paidAt);

        handler.handlePaymentResult("1", "approved", "mp_pay_1");

        assertEquals(settled, order.getStatus(), "o pedido não pode voltar de status");
        assertEquals(paidAt, order.getPaidAt());
        verify(productRepository, never()).decrementStock(anyLong(), anyInt());
        verify(cartRepository, never()).delete(any(Cart.class));
    }

    @ParameterizedTest(name = "pending atrasado não devolve um pedido {0} para pendente")
    @EnumSource(value = OrderStatus.class, names = {"PAID", "SHIPPED", "DELIVERED", "REFUNDED"})
    void latePending_shouldNotReopenASettledOrder(OrderStatus settled) {
        Order order = order(settled);

        handler.handlePaymentResult("1", "pending", null);

        assertEquals(settled, order.getStatus());
    }

    @ParameterizedTest(name = "rejected atrasado não cancela um pedido {0}")
    @EnumSource(value = OrderStatus.class, names = {"PAID", "SHIPPED", "DELIVERED", "REFUNDED"})
    void lateRejection_shouldNotCancelASettledOrder(OrderStatus settled) {
        Order order = order(settled);

        handler.handlePaymentResult("1", "rejected", null);

        assertEquals(settled, order.getStatus());
        verify(cartService, never()).restoreToActive(any());
        verify(orderRepository, never()).delete(any(Order.class));
    }

    // ── pagamento que chega depois do cancelamento ───────────────────────────

    @Test
    @DisplayName("approved num pedido já cancelado ainda marca como pago: o dinheiro entrou")
    void approvalAfterCancellation_shouldStillRecordThePayment() {
        // Pix pago depois do CartCleanupScheduler cancelar o pedido, ou o cliente
        // cancela numa aba e paga na outra. Recusar o pagamento não devolve o
        // dinheiro; o pedido tem que aparecer como pago para ser enviado.
        Order order = order(OrderStatus.CANCELLED);

        handler.handlePaymentResult("1", "approved", "mp_pay_late");

        assertEquals(OrderStatus.PAID, order.getStatus());
        assertEquals("mp_pay_late", order.getMercadoPagoPaymentId());
        verify(productRepository, times(1)).decrementStock(10L, 3);
    }
}
