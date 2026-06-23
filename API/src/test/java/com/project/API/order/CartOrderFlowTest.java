package com.project.API.order;

import com.project.API.cart.Cart;
import com.project.API.cart.CartRepository;
import com.project.API.cart.CartStatus;
import com.project.API.commom.exception.CartInconsistencyException;
import com.project.API.order.interfaces.QuantityChecks;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CartOrderFlowTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private ShippingService shippingService;
    private OrderServiceImp orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        shippingService = Mockito.mock(ShippingService.class);
        orderService = new OrderServiceImp(orderRepository, cartRepository, productRepository, shippingService);
    }

    // ── checkout() validation ─────────────────────────────────────────────────

    @Test
    void checkout_shouldThrowCartInconsistencyException_whenStockIsInsufficient() {
        User user = OrderFactory.mockUser(1L);
        var product = OrderFactory.mockProduct(10L, 2, java.math.BigDecimal.TEN);
        var cartItem = OrderFactory.mockCartItem(1L, product, 5); // user wants 5, stock has 2
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of(cartItem));

        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.ACTIVE)).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(stockOf(10L, 2)));

        assertThrows(CartInconsistencyException.class, () -> orderService.checkout(1L));
    }

    @Test
    void checkout_shouldNotThrowInconsistency_whenStockIsSufficient() {
        User user = OrderFactory.mockUser(1L);
        var product = OrderFactory.mockProduct(10L, 10, java.math.BigDecimal.TEN);
        var cartItem = OrderFactory.mockCartItem(1L, product, 3); // user wants 3, stock has 10
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of(cartItem));

        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.ACTIVE)).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(stockOf(10L, 10)));
        // Existing PENDING order → createOrder returns early, avoiding MP API call
        Order existing = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, 3));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.of(existing));
        existing.setMercadoPagoPreferenceId("pref_already_set");

        // Should not throw CartInconsistencyException
        assertDoesNotThrow(() -> {
            try { orderService.checkout(1L); } catch (Exception e) {
                if (e instanceof CartInconsistencyException) throw e;
                // MP / other exceptions are acceptable here (no real API in unit test)
            }
        });
    }

    // ── handlePaymentResult() ────────────────────────────────────────────────

    @Test
    void handlePaymentResult_approved_shouldMarkOrderPaid_decrementStock_deleteCart() {
        User user = OrderFactory.mockUser(1L);
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, 3));
        Cart checkoutCart = OrderFactory.mockCart(2L, user, CartStatus.CHECKOUT, List.of());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(10));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.of(checkoutCart));

        orderService.handlePaymentResult("1", "approved", "mp_payment_123");

        assertEquals(OrderStatus.PAID, order.getStatus());
        assertEquals("mp_payment_123", order.getMercadoPagoPaymentId());
        assertNotNull(order.getPaidAt());
        verify(productRepository).decrementStock(10L, 3);
        verify(cartRepository).delete(checkoutCart);
        verify(orderRepository).save(order);
    }

    @Test
    void handlePaymentResult_rejected_shouldCancelOrder_revertCartToActive() {
        User user = OrderFactory.mockUser(1L);
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, 3));

        Cart checkoutCart = mock(Cart.class);
        when(checkoutCart.getStatus()).thenReturn(CartStatus.CHECKOUT);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.of(checkoutCart));

        orderService.handlePaymentResult("1", "rejected", null);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(checkoutCart).setStatus(CartStatus.ACTIVE);
        verify(cartRepository).save(checkoutCart);
        verify(productRepository, never()).decrementStock(anyLong(), anyInt());
    }

    @Test
    void handlePaymentResult_pending_shouldKeepOrderPending_andNotTouchCart() {
        User user = OrderFactory.mockUser(1L);
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, List.of());

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        orderService.handlePaymentResult("1", "pending", null);

        assertEquals(OrderStatus.PENDING, order.getStatus());
        verify(cartRepository, never()).findByUserIdAndStatus(anyLong(), any());
        verify(productRepository, never()).decrementStock(anyLong(), anyInt());
    }

    @Test
    void handlePaymentResult_approved_whenNoCartExists_shouldStillCompletePayment() {
        User user = OrderFactory.mockUser(1L);
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, 1));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(5));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.empty());

        orderService.handlePaymentResult("1", "approved", "mp_pay_456");

        assertEquals(OrderStatus.PAID, order.getStatus());
        verify(productRepository).decrementStock(10L, 1);
        verify(cartRepository, never()).delete(any(Cart.class));
    }

    // ── createOrder() ────────────────────────────────────────────────────────

    @Test
    void createOrder_shouldReturnExistingPendingOrder_withoutCreatingNewOne() {
        User user = OrderFactory.mockUser(1L);
        Order existing = OrderFactory.orderWithItems(user, OrderStatus.PENDING, List.of());
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of());

        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.of(existing));

        Order result = orderService.createOrder(1L, cart);

        assertSame(existing, result);
        verify(orderRepository, never()).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private QuantityChecks stockOf(Long id, int qty) {
        return new QuantityChecks() {
            public Long getId() { return id; }
            public int getQuantity() { return qty; }
        };
    }
}
