package com.project.API.cart;

import com.project.API.order.Order;
import com.project.API.order.OrderRepository;
import com.project.API.order.OrderStatus;
import com.project.API.order.StockReservation;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class
CartCleanupScheduler {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final StockReservation stockReservation;

    public CartCleanupScheduler(OrderRepository orderRepository, CartRepository cartRepository,
                                CartService cartService, StockReservation stockReservation) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.stockReservation = stockReservation;
    }

    @Scheduled(fixedDelayString = "${cart.cleanup.interval-ms:3600000}")
    @Transactional
    public void cancelAbandonedOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);

        // Cancel stale PENDING orders and revert their carts
        List<Order> staleOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);
        for (Order order : staleOrders) {
            // Before the cart comes back, which caps its lines at stock.
            stockReservation.release(order);
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Via restoreToActive, not a bare status flip: the user may well have
            // started a new cart while this order sat pending, and two ACTIVE carts
            // break every subsequent cart read for them.
            cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                    .ifPresent(cartService::restoreToActive);
        }

        // Revert CHECKOUT carts with no associated PENDING order
        // (can happen when MP API fails after cart is set to CHECKOUT)
        List<Cart> checkoutCarts = cartRepository.findByStatus(CartStatus.CHECKOUT);
        for (Cart cart : checkoutCarts) {
            boolean hasPendingOrder = orderRepository
                    .findByUserIdAndStatus(cart.getUser().getId(), OrderStatus.PENDING)
                    .isPresent();
            if (!hasPendingOrder) {
                cartService.restoreToActive(cart);
            }
        }
    }
}
