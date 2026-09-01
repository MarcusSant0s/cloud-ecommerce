package com.project.API.cart;

import com.project.API.cart.dto.CartResponseDTO;
import com.project.API.cart.exception.InsufficientStockException;
import com.project.API.product.Product;
import com.project.API.product.ProductRepository;
import com.project.API.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Edge cases around the quantity that POST /cart/{userId}/add takes straight from
 * a request parameter. These assert the behaviour the endpoint should have, so a
 * failure here is a real defect rather than a change in behaviour.
 */
class CartServiceEdgeCaseTest {

    private CartRepository cartRepository;
    private CartItemRepository cartItemRepository;
    private UserRepository userRepository;
    private ProductRepository productRepository;
    private CartService cartService;

    private static final Long USER_ID = 1L;
    private static final Long PRODUCT_ID = 10L;

    private Cart cart;
    private Product product;

    @BeforeEach
    void setUp() {
        cartRepository = Mockito.mock(CartRepository.class);
        cartItemRepository = Mockito.mock(CartItemRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        productRepository = Mockito.mock(ProductRepository.class);
        cartService = new CartService(cartRepository, cartItemRepository, userRepository, productRepository);

        cart = new Cart();
        cart.setStatus(CartStatus.ACTIVE);

        product = Mockito.mock(Product.class);
        when(product.getId()).thenReturn(PRODUCT_ID);
        when(product.getName()).thenReturn("Bicicleta");
        when(product.getQuantity()).thenReturn(10);
        when(product.getFinalPrice()).thenReturn(new BigDecimal("100.00"));
        when(product.getImages()).thenReturn(java.util.Set.of());

        when(cartRepository.findByUserIdAndStatus(USER_ID, CartStatus.ACTIVE))
                .thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findById(PRODUCT_ID)).thenReturn(Optional.of(product));
        // Stock for this product is 10.
        when(productRepository.findQuantityById(PRODUCT_ID)).thenReturn(Optional.of(10));
    }

    private CartItem itemInCart(Long id, int quantity) {
        CartItem item = new CartItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setProduct(product);
        item.setQuantity(quantity);
        cart.addCartItem(item);
        return item;
    }

    @Test
    @DisplayName("a negative quantity must be rejected, not turned into a negative subtotal")
    void addItem_shouldRejectNegativeQuantity() {
        assertThrows(IllegalArgumentException.class,
                () -> cartService.addItem(USER_ID, PRODUCT_ID, -3));
    }

    @Test
    @DisplayName("a zero quantity must be rejected rather than creating an empty line")
    void addItem_shouldRejectZeroQuantity() {
        assertThrows(IllegalArgumentException.class,
                () -> cartService.addItem(USER_ID, PRODUCT_ID, 0));
    }

    @Test
    @DisplayName("a first add must be stock-checked, the same as an increment is")
    void addItem_shouldRejectMoreThanStock_forAProductNotYetInTheCart() {
        // Stock is 10; asking for 9999 must not succeed.
        assertThrows(InsufficientStockException.class,
                () -> cartService.addItem(USER_ID, PRODUCT_ID, 9999));
    }

    @Test
    @DisplayName("adding N of a product already in the cart must add N, not 1")
    void addItem_shouldAddTheRequestedQuantity_whenTheProductIsAlreadyInTheCart() {
        itemInCart(1L, 3);

        cartService.addItem(USER_ID, PRODUCT_ID, 4);

        assertEquals(7, cart.getCartItem().get(0).getQuantity(),
                "3 already in the cart plus 4 more should be 7");
    }

    @Test
    @DisplayName("a negative quantity must never produce a negative cart total")
    void cartTotal_shouldNeverGoNegative() {
        // Simulates what addItem currently allows through.
        itemInCart(1L, -3);

        CartResponseDTO response = cartService.getActiveCartDTO(USER_ID);

        assertTrue(response.totalCartValue().compareTo(BigDecimal.ZERO) >= 0,
                "cart total was " + response.totalCartValue());
    }

    @Test
    @DisplayName("a valid add still works")
    void addItem_shouldAcceptAValidQuantity() {
        cartService.addItem(USER_ID, PRODUCT_ID, 2);

        assertEquals(1, cart.getCartItem().size());
        assertEquals(2, cart.getCartItem().get(0).getQuantity());
    }

    @Test
    @DisplayName("decrementing the last unit removes the line and never goes negative")
    void updateQuantity_shouldNotLeaveANegativeQuantity() {
        CartItem item = itemInCart(1L, 1);

        cartService.updateQuantity(USER_ID, 1L, false);

        assertTrue(cart.getCartItem().isEmpty(), "the line should be gone");
        assertTrue(item.getQuantity() >= 0, "quantity went to " + item.getQuantity());
    }
}
