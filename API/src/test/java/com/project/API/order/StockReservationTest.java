package com.project.API.order;

import com.project.API.cart.Cart;
import com.project.API.cart.CartCleanupScheduler;
import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.CartStatus;
import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * O pedido separa o estoque quando é criado e devolve quando é cancelado.
 *
 * Antes a baixa só acontecia na aprovação do pagamento: dois clientes podiam fechar o
 * checkout da última peça, os dois pagavam, e a segunda aprovação não achava estoque.
 */
class StockReservationTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private CartService cartService;
    private ShippingService shippingService;
    private StockReservation stockReservation;
    private OrderServiceImp orderService;
    private PaymentResultHandler paymentResultHandler;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        cartService = Mockito.mock(CartService.class);
        shippingService = Mockito.mock(ShippingService.class);
        stockReservation = new StockReservation(productRepository);
        paymentResultHandler = new PaymentResultHandler(orderRepository, cartRepository, cartService, stockReservation);
        orderService = new OrderServiceImp(orderRepository, cartRepository, productRepository,
                shippingService, cartService, paymentResultHandler, stockReservation);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shippingService.calculate(anyString())).thenReturn(new BigDecimal("15.00"));
    }

    private User userWithAddress() {
        User user = OrderFactory.mockUser(1L);
        when(user.getUserAdress()).thenReturn(new UserAdress("Rua A", "São Paulo", "01000-000", "10"));
        return user;
    }

    private Order orderOf(OrderStatus status, boolean reserved, List<OrderItem> items) {
        Order order = OrderFactory.orderWithItems(OrderFactory.mockUser(1L), status, items);
        order.setStockReserved(reserved);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));
        return order;
    }

    // ── o componente ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("reservar baixa cada item e marca o pedido como segurando estoque")
    void reserve_shouldTakeEveryItem() {
        Order order = orderOf(OrderStatus.PENDING, false,
                List.of(OrderFactory.orderItem(10L, 2), OrderFactory.orderItem(20L, 1)));
        when(productRepository.decrementStock(anyLong(), anyInt())).thenReturn(1);

        stockReservation.reserve(order);

        verify(productRepository).decrementStock(10L, 2);
        verify(productRepository).decrementStock(20L, 1);
        assertTrue(order.isStockReserved());
    }

    @Test
    @DisplayName("faltando um item, reservar falha e não marca o pedido")
    void reserve_shouldFailWhenAnItemIsShort() {
        Order order = orderOf(OrderStatus.PENDING, false, OrderFactory.singleItem(10L, 3));
        when(productRepository.decrementStock(10L, 3)).thenReturn(0);
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(2));

        InsufficientStockException ex =
                assertThrows(InsufficientStockException.class, () -> stockReservation.reserve(order));

        assertTrue(ex.getMessage().contains("apenas 2"), ex.getMessage());
        assertFalse(order.isStockReserved());
    }

    @Test
    @DisplayName("reservar duas vezes baixa uma vez só")
    void reserve_shouldBeIdempotent() {
        Order order = orderOf(OrderStatus.PENDING, false, OrderFactory.singleItem(10L, 3));
        when(productRepository.decrementStock(10L, 3)).thenReturn(1);

        stockReservation.reserve(order);
        stockReservation.reserve(order);

        verify(productRepository, times(1)).decrementStock(10L, 3);
    }

    @Test
    @DisplayName("devolver duas vezes repõe uma vez só")
    void release_shouldBeIdempotent() {
        Order order = orderOf(OrderStatus.PENDING, true, OrderFactory.singleItem(10L, 3));

        stockReservation.release(order);
        stockReservation.release(order);

        verify(productRepository, times(1)).incrementStock(10L, 3);
        assertFalse(order.isStockReserved());
    }

    @Test
    @DisplayName("pedido que nunca separou estoque não devolve nada")
    void release_shouldNotReturnStockThatWasNeverTaken() {
        Order order = orderOf(OrderStatus.PENDING, false, OrderFactory.singleItem(10L, 3));

        stockReservation.release(order);

        verify(productRepository, never()).incrementStock(anyLong(), anyInt());
    }

    @Test
    @DisplayName("pedido já pago sem estoque é marcado mesmo assim: o dinheiro entrou")
    void reserveForPaidOrder_shouldNotThrowWhenShort() {
        Order order = orderOf(OrderStatus.PAID, false, OrderFactory.singleItem(10L, 3));
        when(productRepository.decrementStock(10L, 3)).thenReturn(0);
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(2));

        assertDoesNotThrow(() -> stockReservation.reserveForPaidOrder(order));
        assertTrue(order.isStockReserved());
    }

    // ── criação do pedido ────────────────────────────────────────────────────

    @Test
    @DisplayName("criar o pedido separa o estoque")
    void createOrder_shouldReserveStock() {
        User user = userWithAddress();
        var product = OrderFactory.mockProduct(10L, 10, new BigDecimal("100.00"));
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE,
                List.of(OrderFactory.mockCartItem(1L, product, 2)));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.empty());
        when(productRepository.decrementStock(10L, 2)).thenReturn(1);

        Order order = orderService.createOrder(1L, cart);

        verify(productRepository).decrementStock(10L, 2);
        assertTrue(order.isStockReserved());
    }

    @Test
    @DisplayName("dois clientes, uma peça: o segundo pedido não é criado")
    void createOrder_shouldRefuseWhenAnotherOrderTookTheLastUnit() {
        User user = userWithAddress();
        var product = OrderFactory.mockProduct(10L, 1, new BigDecimal("100.00"));
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE,
                List.of(OrderFactory.mockCartItem(1L, product, 1)));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.empty());
        // A outra compra já baixou a peça: o UPDATE condicional não acha estoque.
        when(productRepository.decrementStock(10L, 1)).thenReturn(0);
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(0));

        assertThrows(InsufficientStockException.class, () -> orderService.createOrder(1L, cart));
        verify(orderRepository, never()).save(any(Order.class));
    }

    // ── pagamento ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("aprovar um pedido que já separou estoque não baixa de novo")
    void approval_shouldNotTakeStockTwice() {
        Order order = orderOf(OrderStatus.PENDING, true, OrderFactory.singleItem(10L, 3));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.empty());

        paymentResultHandler.handlePaymentResult("1", "approved", "mp_pay_1");

        assertEquals(OrderStatus.PAID, order.getStatus());
        verify(productRepository, never()).decrementStock(anyLong(), anyInt());
    }

    @Test
    @DisplayName("pedido pendente de antes da reserva ainda baixa o estoque ao ser aprovado")
    void approval_shouldTakeStockForALegacyOrder() {
        Order order = orderOf(OrderStatus.PENDING, false, OrderFactory.singleItem(10L, 3));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.empty());
        when(productRepository.decrementStock(10L, 3)).thenReturn(1);

        paymentResultHandler.handlePaymentResult("1", "approved", "mp_pay_1");

        verify(productRepository, times(1)).decrementStock(10L, 3);
        assertTrue(order.isStockReserved());
    }

    // ── cancelamento ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("cliente cancela: o estoque volta antes do carrinho")
    void cancelOrder_shouldReturnStockBeforeRestoringTheCart() {
        Order order = orderOf(OrderStatus.PENDING, true, OrderFactory.singleItem(10L, 3));
        Cart checkoutCart = OrderFactory.mockCart(2L, order.getUser(), CartStatus.CHECKOUT, List.of());
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.of(checkoutCart));

        orderService.cancelOrder(1L, 1L);

        // restoreToActive limita cada linha ao estoque, então as peças já precisam ter voltado.
        var inOrder = inOrder(productRepository, cartService);
        inOrder.verify(productRepository).incrementStock(10L, 3);
        inOrder.verify(cartService).restoreToActive(checkoutCart);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertFalse(order.isStockReserved());
    }

    @Test
    @DisplayName("pedido abandonado cancelado pelo scheduler devolve o estoque")
    void scheduler_shouldReturnStockOfAbandonedOrders() {
        Order stale = orderOf(OrderStatus.PENDING, true, OrderFactory.singleItem(10L, 3));
        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of(stale));
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of());
        CartCleanupScheduler scheduler =
                new CartCleanupScheduler(orderRepository, cartRepository, cartService, stockReservation);

        scheduler.cancelAbandonedOrders();

        verify(productRepository).incrementStock(10L, 3);
        assertEquals(OrderStatus.CANCELLED, stale.getStatus());
    }

    @Test
    @DisplayName("admin cancela: o estoque volta; admin reabre: o estoque sai de novo")
    void adminOverride_shouldMoveStockWithTheOrder() {
        Order order = orderOf(OrderStatus.PAID, true, OrderFactory.singleItem(10L, 3));
        when(productRepository.decrementStock(10L, 3)).thenReturn(1);

        orderService.changeOrderStatus(1L, OrderStatus.CANCELLED);
        verify(productRepository).incrementStock(10L, 3);
        assertFalse(order.isStockReserved());

        orderService.changeOrderStatus(1L, OrderStatus.PAID);
        verify(productRepository).decrementStock(10L, 3);
        assertTrue(order.isStockReserved());
    }

    @Test
    @DisplayName("reembolso não devolve a peça ao estoque sozinho")
    void adminRefund_shouldLeaveStockAlone() {
        orderOf(OrderStatus.PAID, true, OrderFactory.singleItem(10L, 3));

        orderService.changeOrderStatus(1L, OrderStatus.REFUNDED);

        verify(productRepository, never()).incrementStock(anyLong(), anyInt());
        verify(productRepository, never()).decrementStock(anyLong(), anyInt());
    }
}
