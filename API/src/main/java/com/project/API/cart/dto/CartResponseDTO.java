package com.project.API.cart.dto;

import com.project.API.cart.CartStatus;

import java.math.BigDecimal;
import java.util.List;

public record CartResponseDTO(
        Long id,
        CartStatus status,
        List<CartItemDTO> items,
        BigDecimal totalCartValue
) {
    public record CartItemDTO(
            Long id,
            Long productId,
            String name,
            String imageUrl,
            BigDecimal finalPrice,
            int quantity,
            int stockAvailable,
            BigDecimal subtotal
    ) {}
}