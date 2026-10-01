package com.project.API.order;

import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.commom.exception.InvalidOrderTransitionException;
import com.project.API.commom.exception.ShippingAddressRequiredException;
import com.project.API.order.DTO.AdminOrderAttentionResponse;
import com.project.API.order.DTO.AdminOrderAttentionResponse.Alert;
import com.project.API.order.DTO.AdminOrderAttentionResponse.AttentionOrder;
import com.project.API.order.DTO.AdminOrderResponse;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.*;

/**
 * O fluxo de envio do painel admin: marcar um pedido pago como enviado e a fila de
 * pedidos que ainda precisam de atenção (não enviados, atrasados, sem endereço,
 * parados em trânsito).
 */
class OrderShippingTest {

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
        ReflectionTestUtils.setField(orderService, "shippingSlaDays", 2);
        ReflectionTestUtils.setField(orderService, "transitAlertDays", 10);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private User userWithAddress(Long id) {
        User user = OrderFactory.mockUser(id);
        when(user.getUserAdress()).thenReturn(new UserAdress("Rua A", "São Paulo", "01001000", "10"));
        return user;
    }

    private Order order(Long id, User user, OrderStatus status) {
        Order order = OrderFactory.orderWithItems(user, status, OrderFactory.singleItem(10L, 1));
        ReflectionTestUtils.setField(order, "id", id);
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));
        return order;
    }

    // ── shipOrder ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("enviar um pedido pago grava status, data e código de rastreio")
    void shouldShipAPaidOrder() {
        order(1L, userWithAddress(1L), OrderStatus.PAID);

        AdminOrderResponse result = orderService.shipOrder(1L, "  QB123456789BR ");

        assertEquals(OrderStatus.SHIPPED, result.status());
        assertNotNull(result.shippedAt());
        assertEquals("QB123456789BR", result.trackingCode());
    }

    @Test
    @DisplayName("código de rastreio em branco vira nenhum")
    void shouldStoreBlankTrackingCodeAsNull() {
        order(1L, userWithAddress(1L), OrderStatus.PAID);

        assertNull(orderService.shipOrder(1L, "   ").trackingCode());
    }

    @Test
    @DisplayName("só pedido pago pode ser enviado")
    void shouldRefuseToShipAnUnpaidOrder() {
        order(1L, userWithAddress(1L), OrderStatus.PENDING);

        assertThrows(InvalidOrderTransitionException.class, () -> orderService.shipOrder(1L, null));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("reenviar um pedido já enviado não reinicia o relógio do trânsito")
    void shouldRefuseToShipTwice() {
        Order order = order(1L, userWithAddress(1L), OrderStatus.SHIPPED);
        LocalDateTime shippedAt = LocalDateTime.now().minusDays(3);
        order.setShippedAt(shippedAt);

        assertThrows(InvalidOrderTransitionException.class, () -> orderService.shipOrder(1L, "X"));
        assertEquals(shippedAt, order.getShippedAt());
    }

    @Test
    @DisplayName("sem endereço não há para onde enviar")
    void shouldRefuseToShipWithoutAddress() {
        order(1L, OrderFactory.mockUser(1L), OrderStatus.PAID);

        assertThrows(ShippingAddressRequiredException.class, () -> orderService.shipOrder(1L, null));
    }

    // ── changeOrderStatus × shippedAt ────────────────────────────────────────

    @Test
    @DisplayName("override para enviado carimba a data de envio")
    void shouldStampShippedAtOnManualShip() {
        order(1L, userWithAddress(1L), OrderStatus.PAID);

        assertNotNull(orderService.changeOrderStatus(1L, OrderStatus.SHIPPED).getShippedAt());
    }

    @Test
    @DisplayName("voltar de enviado para pago apaga a data de envio")
    void shouldClearShippedAtWhenBackToPaid() {
        Order order = order(1L, userWithAddress(1L), OrderStatus.SHIPPED);
        order.setPaidAt(LocalDateTime.now().minusDays(2));
        order.setShippedAt(LocalDateTime.now().minusDays(1));

        Order result = orderService.changeOrderStatus(1L, OrderStatus.PAID);

        assertNull(result.getShippedAt());
        assertNotNull(result.getPaidAt());
    }

    // ── getAttentionOverview ─────────────────────────────────────────────────

    @Test
    @DisplayName("separa a fila em aguardando envio e em trânsito, com os alertas certos")
    void shouldTagOrdersThatNeedAttention() {
        Order fresh = order(1L, userWithAddress(1L), OrderStatus.PAID);
        fresh.setPaidAt(LocalDateTime.now().minusHours(5));

        Order late = order(2L, userWithAddress(2L), OrderStatus.PAID);
        late.setPaidAt(LocalDateTime.now().minusDays(3));

        Order noAddress = order(3L, OrderFactory.mockUser(3L), OrderStatus.PAID);
        noAddress.setPaidAt(LocalDateTime.now().minusHours(1));

        Order onTheWay = order(4L, userWithAddress(4L), OrderStatus.SHIPPED);
        onTheWay.setShippedAt(LocalDateTime.now().minusDays(2));

        Order stuck = order(5L, userWithAddress(5L), OrderStatus.SHIPPED);
        stuck.setShippedAt(LocalDateTime.now().minusDays(12));

        when(orderRepository.findByStatusIn(anyCollection()))
                .thenReturn(List.of(fresh, late, noAddress, onTheWay, stuck));

        AdminOrderAttentionResponse overview = orderService.getAttentionOverview();

        // Mais antigo primeiro: é o que está esperando há mais tempo.
        assertEquals(List.of(2L, 1L, 3L), ids(overview.awaitingShipment()));
        assertEquals(List.of(Alert.LATE_SHIPMENT), alertsOf(overview.awaitingShipment(), 2L));
        assertEquals(List.of(Alert.NO_ADDRESS), alertsOf(overview.awaitingShipment(), 3L));
        assertEquals(List.of(), alertsOf(overview.awaitingShipment(), 1L));

        assertEquals(List.of(5L, 4L), ids(overview.inTransit()));
        assertEquals(List.of(Alert.LONG_IN_TRANSIT), alertsOf(overview.inTransit(), 5L));
        assertEquals(List.of(), alertsOf(overview.inTransit(), 4L));

        assertEquals(2, overview.shippingSlaDays());
        assertEquals(10, overview.transitAlertDays());
    }

    @Test
    @DisplayName("pedido pago sem data de pagamento cai na data de criação, não some da fila")
    void shouldFallBackToCreatedAtWhenPaidAtIsMissing() {
        Order legacy = order(1L, userWithAddress(1L), OrderStatus.PAID);
        legacy.setPaidAt(null);
        legacy.setCreatedAt(LocalDateTime.now().minusDays(5));
        when(orderRepository.findByStatusIn(anyCollection())).thenReturn(List.of(legacy));

        AdminOrderAttentionResponse overview = orderService.getAttentionOverview();

        assertEquals(List.of(Alert.LATE_SHIPMENT), alertsOf(overview.awaitingShipment(), 1L));
    }

    private static List<Long> ids(List<AttentionOrder> list) {
        return list.stream().map(a -> a.order().id()).toList();
    }

    private static List<Alert> alertsOf(List<AttentionOrder> list, Long id) {
        return list.stream().filter(a -> a.order().id().equals(id)).findFirst().orElseThrow().alerts();
    }
}
