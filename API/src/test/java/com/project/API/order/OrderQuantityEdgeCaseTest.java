package com.project.API.order;

import com.project.API.cart.Cart;
import com.project.API.cart.CartRepository;
import com.project.API.cart.CartService;
import com.project.API.cart.CartStatus;
import com.project.API.order.interfaces.QuantityChecks;
import com.project.API.product.ProductRepository;
import com.project.API.shipping.ShippingService;
import com.project.API.user.User;
import com.project.API.user.UserAdress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * What a non-positive cart quantity does once it reaches the order. Both the
 * stock check and the total are plain comparisons/multiplications, so a negative
 * quantity does not fail loudly — it passes validation and moves money the wrong
 * way.
 */
class OrderQuantityEdgeCaseTest {

    private OrderRepository orderRepository;
    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private ShippingService shippingService;
    private CartService cartService;
    private OrderServiceImp orderService;

    @BeforeEach
    void setUp() {
        orderRepository = Mockito.mock(OrderRepository.class);
        cartRepository = Mockito.mock(CartRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        shippingService = Mockito.mock(ShippingService.class);
        cartService = Mockito.mock(CartService.class);
        orderService = new OrderServiceImp(orderRepository, cartRepository, productRepository, shippingService, cartService);

        when(shippingService.calculate(anyString())).thenReturn(new BigDecimal("15.00"));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.findByUserIdAndStatus(1L, OrderStatus.PENDING)).thenReturn(Optional.empty());
    }

    private User userWithAddress() {
        User user = Mockito.mock(User.class);
        UserAdress address = new UserAdress("Rua A", "São Paulo", "01000-000", "10");
        when(user.getId()).thenReturn(1L);
        when(user.getUserAdress()).thenReturn(address);
        return user;
    }

    private QuantityChecks stockOf(Long id, int qty) {
        return new QuantityChecks() {
            public Long getId() { return id; }
            public int getQuantity() { return qty; }
        };
    }

    @Test
    @DisplayName("a non-positive quantity must be rejected, not multiplied into a negative total")
    void createOrder_shouldRejectANonPositiveQuantity() {
        User user = userWithAddress();
        var product = OrderFactory.mockProduct(10L, 10, new BigDecimal("100.00"));
        var item = OrderFactory.mockCartItem(1L, product, -3);
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of(item));

        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(10));

        // Before the fix this returned an order totalling -285.00 (-300 + 15 shipping).
        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(1L, cart));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("checkout must reject a non-positive quantity rather than pass the stock check")
    void checkout_shouldRejectANonPositiveQuantity() {
        User user = userWithAddress();
        var product = OrderFactory.mockProduct(10L, 10, new BigDecimal("100.00"));
        var item = OrderFactory.mockCartItem(1L, product, -3);
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of(item));

        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.ACTIVE)).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdIn(anyCollection())).thenReturn(List.of(stockOf(10L, 10)));
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(10));

        // "stock 10 < requested -3" is false, so the inconsistency check waves it through.
        assertThrows(IllegalArgumentException.class, () -> orderService.checkout(1L));
    }

    @Test
    @DisplayName("paying an order must never hand decrementStock a negative quantity")
    void payment_shouldNeverIncreaseStock() {
        User user = OrderFactory.mockUser(1L);
        // A negative-quantity line that made it as far as a PENDING order.
        Order order = OrderFactory.orderWithItems(user, OrderStatus.PENDING, OrderFactory.singleItem(10L, -3));

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(10));
        when(cartRepository.findByUserIdAndStatus(1L, CartStatus.CHECKOUT)).thenReturn(Optional.empty());

        orderService.handlePaymentResult("1", "approved", "mp_pay_1");

        // "quantity = quantity - (-3)" adds stock, and the "quantity >= qty" guard
        // in the UPDATE is always true for a negative qty.
        verify(productRepository, never()).decrementStock(eq(10L), intThat(q -> q < 0));
    }

    @Test
    @DisplayName("a normal order still totals correctly")
    void createOrder_shouldTotalCorrectlyForAValidCart() {
        User user = userWithAddress();
        var product = OrderFactory.mockProduct(10L, 10, new BigDecimal("100.00"));
        var item = OrderFactory.mockCartItem(1L, product, 2);
        Cart cart = OrderFactory.mockCart(1L, user, CartStatus.ACTIVE, List.of(item));

        when(productRepository.findQuantityById(10L)).thenReturn(Optional.of(10));

        Order order = orderService.createOrder(1L, cart);

        // 2 x 100.00 + 15.00 shipping
        assertEquals(0, new BigDecimal("215.00").compareTo(order.getTotal()),
                "expected 215.00, got " + order.getTotal());
    }
}
