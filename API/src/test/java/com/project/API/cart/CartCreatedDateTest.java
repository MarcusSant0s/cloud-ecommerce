package com.project.API.cart;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * cart.created_date used to be NULL for every row: the field carried Spring Data's
 * @CreatedDate, which does nothing unless JPA auditing is enabled, and it never was.
 * These assert the @PrePersist hook that replaced it, so the field going quiet again
 * fails here rather than in production data.
 */
class CartCreatedDateTest {

    @Test
    @DisplayName("a new cart is stamped when it is persisted")
    void onCreate_shouldStampCreatedDate() {
        Cart cart = new Cart();
        assertNull(cart.getCreatedDate(), "unsaved cart should not be stamped yet");

        Instant before = Instant.now();
        cart.onCreate();

        assertNotNull(cart.getCreatedDate(), "persisting a cart must set created_date");
        assertFalse(cart.getCreatedDate().isBefore(before), "stamp should be the persist time");
        assertFalse(cart.getCreatedDate().isAfter(Instant.now()), "stamp should not be in the future");
    }

    @Test
    @DisplayName("an explicit creation time survives the hook")
    void onCreate_shouldNotOverwriteAnExistingValue() {
        Cart cart = new Cart();
        Instant seeded = Instant.parse("2020-01-01T00:00:00Z");
        ReflectionTestUtils.setField(cart, "createdDate", seeded);

        cart.onCreate();

        assertEquals(seeded, cart.getCreatedDate());
    }
}
