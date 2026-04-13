package com.project.API.cart.dto;

import com.project.API.cart.CartItemStatus;

import java.math.BigDecimal;
import java.util.List;

public record CartResponseDTO(
        Long id,
        CartItemStatus status,
        List<CartItemDTO> items,
        BigDecimal totalCartValue
) {
    public record CartItemDTO(
            Long id,
            Long productId,
            String name,
            String imageUrl,
            BigDecimal price, // Alterado para BigDecimal
            int quantity,
            int stockAvailable,
            BigDecimal subtotal // Bom enviar o subtotal já calculado
    ) {}
}