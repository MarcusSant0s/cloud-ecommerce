package com.project.API.cart;

import com.project.API.order.Order;
import com.project.API.order.OrderRepository;
import com.project.API.order.OrderStatus;
import com.project.API.order.OrderFactory;
import com.project.API.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class CartCleanupSchedulerTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private CartCleanupScheduler scheduler;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        scheduler = new CartCleanupScheduler(orderRepository, cartRepository);
    }

    @Test
    void shouldCancelStaleOrderAndRevertCartToActive() {
        User user = OrderFactory.mockUser(1L);
        Order staleOrder = OrderFactory.orderWithItems(user, OrderStatus.PENDING, List.of());
        Cart checkoutCart = mock(Cart.class);

        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of(staleOrder));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT))
                .thenReturn(Optional.of(checkoutCart));
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of());

        scheduler.cancelAbandonedOrders();

        assertEquals(OrderStatus.CANCELLED, staleOrder.getStatus());
        verify(checkoutCart).setStatus(CartStatus.ACTIVE);
        verify(cartRepository).save(checkoutCart);
        verify(orderRepository).save(staleOrder);
    }

    @Test
    void shouldCancelMultipleStaleOrders() {
        User user1 = OrderFactory.mockUser(1L);
        User user2 = OrderFactory.mockUser(2L);
        Order order1 = OrderFactory.orderWithItems(user1, OrderStatus.PENDING, List.of());
        Order order2 = OrderFactory.orderWithItems(user2, OrderStatus.PENDING, List.of());

        when(orderRepository.findByStatusAndCreatedAtBefore(eq(OrderStatus.PENDING), any()))
                .thenReturn(List.of(order1, order2));
        when(cartRepository.findByUserIdAndStatus(anyLong(), eq(CartStatus.CHECKOUT)))
                .thenReturn(Optional.empty());
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of());

        scheduler.cancelAbandonedOrders();

        assertEquals(OrderStatus.CANCELLED, order1.getStatus());
        assertEquals(OrderStatus.CANCELLED, order2.getStatus());
        verify(orderRepository, times(2)).save(any(Order.class));
    }

    @Test
    void shouldDoNothing_whenNoStaleOrdersExist() {
        when(orderRepository.findByStatusAndCreatedAtBefore(any(), any())).thenReturn(List.of());
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of());

        scheduler.cancelAbandonedOrders();

        verify(orderRepository, never()).save(any());
        verify(cartRepository, never()).save(any());
    }

    @Test
    void shouldRevertOrphanedCheckoutCart_whenNoPendingOrderExists() {
        // Cart is in CHECKOUT but has no corresponding PENDING order
        // (happens when MP API fails after cart status is set)
        User user = OrderFactory.mockUser(1L);
        Cart orphanedCart = mock(Cart.class);
        when(orphanedCart.getUser()).thenReturn(user);

        when(orderRepository.findByStatusAndCreatedAtBefore(any(), any())).thenReturn(List.of());
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of(orphanedCart));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.empty());

        scheduler.cancelAbandonedOrders();

        verify(orphanedCart).setStatus(CartStatus.ACTIVE);
        verify(cartRepository).save(orphanedCart);
    }

    @Test
    void shouldNotRevertCheckoutCart_whenPendingOrderExists() {
        // Cart is in CHECKOUT and there IS a PENDING order — payment still in progress
        User user = OrderFactory.mockUser(1L);
        Cart activeCheckoutCart = mock(Cart.class);
        when(activeCheckoutCart.getUser()).thenReturn(user);
        Order pendingOrder = OrderFactory.orderWithItems(user, OrderStatus.PENDING, List.of());

        when(orderRepository.findByStatusAndCreatedAtBefore(any(), any())).thenReturn(List.of());
        when(cartRepository.findByStatus(CartStatus.CHECKOUT)).thenReturn(List.of(activeCheckoutCart));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.of(pendingOrder));

        scheduler.cancelAbandonedOrders();

        verify(activeCheckoutCart, never()).setStatus(any());
        verify(cartRepository, never()).save(any());
    }
}
