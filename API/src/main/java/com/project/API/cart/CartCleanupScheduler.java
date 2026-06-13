package com.project.API.cart;

import com.project.API.order.Order;
import com.project.API.order.OrderRepository;
import com.project.API.order.OrderStatus;
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

    public CartCleanupScheduler(OrderRepository orderRepository, CartRepository cartRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
    }

    @Scheduled(fixedDelayString = "${cart.cleanup.interval-ms:3600000}")
    @Transactional
    public void cancelAbandonedOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);

        // Cancel stale PENDING orders and revert their carts
        List<Order> staleOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);
        for (Order order : staleOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            cartRepository.findByUserIdAndStatus(order.getUser().getId(), CartStatus.CHECKOUT)
                    .ifPresent(cart -> {
                        cart.setStatus(CartStatus.ACTIVE);
                        cartRepository.save(cart);
                    });
        }

        // Revert CHECKOUT carts with no associated PENDING order
        // (can happen when MP API fails after cart is set to CHECKOUT)
        List<Cart> checkoutCarts = cartRepository.findByStatus(CartStatus.CHECKOUT);
        for (Cart cart : checkoutCarts) {
            boolean hasPendingOrder = orderRepository
                    .findByUserIdAndStatus(cart.getUser().getId(), OrderStatus.PENDING)
                    .isPresent();
            if (!hasPendingOrder) {
                cart.setStatus(CartStatus.ACTIVE);
                cartRepository.save(cart);
            }
        }
    }
}
