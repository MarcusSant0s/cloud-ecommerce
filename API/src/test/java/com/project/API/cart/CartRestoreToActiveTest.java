package com.project.API.cart;

import com.project.API.product.Product;
import com.project.API.product.ProductRepository;
import com.project.API.user.User;
import com.project.API.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * A user must never hold two ACTIVE carts. findByUserIdAndStatus returns an Optional,
 * so a second one makes every cart request for that account fail with "Query did not
 * return a unique result" until the row is deleted by hand.
 *
 * <p>Handing a CHECKOUT cart back used to be a bare status flip, which produced exactly
 * that whenever the user had already started a new cart — and they will have, since
 * opening the cart page during a pending order is enough to mint one. These cover the
 * reconciliation that replaced the flip.
 */
class CartRestoreToActiveTest {

    private CartRepository cartRepository;
    private ProductRepository productRepository;
    private CartService cartService;

    private static final Long USER_ID = 1L;

    private User user;

    @BeforeEach
    void setUp() {
        cartRepository = Mockito.mock(CartRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        cartService = new CartService(cartRepository, Mockito.mock(CartItemRepository.class),
                Mockito.mock(UserRepository.class), productRepository);

        user = Mockito.mock(User.class);
        when(user.getId()).thenReturn(USER_ID);
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private Cart cart(Long id, CartStatus status) {
        Cart cart = new Cart();
        ReflectionTestUtils.setField(cart, "id", id);
        cart.setUser(user);
        cart.setStatus(status);
        return cart;
    }

    private Product product(Long id, int stock) {
        Product product = Mockito.mock(Product.class);
        when(product.getId()).thenReturn(id);
        when(productRepository.findQuantityById(id)).thenReturn(Optional.of(stock));
        return product;
    }

    private void addLine(Cart cart, Product product, int quantity) {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(quantity);
        cart.addCartItem(item);
    }

    @Test
    @DisplayName("with no competing cart the abandoned one simply becomes active again")
    void shouldFlip_whenTheUserHasNoOtherActiveCart() {
        Cart checkoutCart = cart(1L, CartStatus.CHECKOUT);
        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE)).thenReturn(Optional.empty());

        cartService.restoreToActive(checkoutCart);

        assertEquals(CartStatus.ACTIVE, checkoutCart.getStatus());
        verify(cartRepository).save(checkoutCart);
        verify(cartRepository, never()).delete(any(Cart.class));
    }

    @Test
    @DisplayName("a cart the user built meanwhile absorbs the abandoned lines, leaving one active cart")
    void shouldMergeIntoTheExistingCart_ratherThanCreatingASecondActiveOne() {
        Product bicycle = product(10L, 10);
        Product helmet = product(20L, 10);

        Cart activeCart = cart(2L, CartStatus.ACTIVE);
        addLine(activeCart, bicycle, 1);

        Cart checkoutCart = cart(1L, CartStatus.CHECKOUT);
        addLine(checkoutCart, helmet, 2);

        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE)).thenReturn(Optional.of(activeCart));

        cartService.restoreToActive(checkoutCart);

        assertNotEquals(CartStatus.ACTIVE, checkoutCart.getStatus(),
                "the abandoned cart must not become a second active cart");
        verify(cartRepository).delete(checkoutCart);

        assertEquals(2, activeCart.getCartItem().size(), "the abandoned line should have moved over");
        assertEquals(2, activeCart.getCartItem().stream()
                .filter(item -> item.getProduct().getId().equals(20L))
                .findFirst().orElseThrow().getQuantity());
    }

    @Test
    @DisplayName("the same product in both carts is summed, not duplicated into two lines")
    void shouldSumQuantitiesForTheSameProduct() {
        Product bicycle = product(10L, 10);

        Cart activeCart = cart(2L, CartStatus.ACTIVE);
        addLine(activeCart, bicycle, 2);

        Cart checkoutCart = cart(1L, CartStatus.CHECKOUT);
        addLine(checkoutCart, bicycle, 3);

        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE)).thenReturn(Optional.of(activeCart));

        cartService.restoreToActive(checkoutCart);

        assertEquals(1, activeCart.getCartItem().size());
        assertEquals(5, activeCart.getCartItem().getFirst().getQuantity());
    }

    @Test
    @DisplayName("the merged quantity is capped at stock, so getOrCreateCart does not drop the whole line")
    void shouldCapTheMergedQuantityAtAvailableStock() {
        Product bicycle = product(10L, 4);

        Cart activeCart = cart(2L, CartStatus.ACTIVE);
        addLine(activeCart, bicycle, 2);

        Cart checkoutCart = cart(1L, CartStatus.CHECKOUT);
        addLine(checkoutCart, bicycle, 3);

        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE)).thenReturn(Optional.of(activeCart));

        cartService.restoreToActive(checkoutCart);

        assertEquals(4, activeCart.getCartItem().getFirst().getQuantity(),
                "2 + 3 outruns the 4 in stock, so it should trim rather than sum to 5");
    }

    @Test
    @DisplayName("a caller that has not flushed its CHECKOUT status gets a flip, not a merge with itself")
    void shouldOnlyFlip_whenTheQueryFindsTheVerySameCart() {
        Product bicycle = product(10L, 10);
        Cart checkoutCart = cart(1L, CartStatus.CHECKOUT);
        addLine(checkoutCart, bicycle, 2);

        // createCheckout's failure path reverts a cart whose new status is still only
        // in the persistence context, so the query can hand back that same row.
        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE)).thenReturn(Optional.of(checkoutCart));

        cartService.restoreToActive(checkoutCart);

        assertEquals(CartStatus.ACTIVE, checkoutCart.getStatus());
        assertEquals(1, checkoutCart.getCartItem().size(), "it must not merge into itself");
        verify(cartRepository, never()).delete(any(Cart.class));
    }
}
