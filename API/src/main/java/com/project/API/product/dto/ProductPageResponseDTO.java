package com.project.API.product.dto;

import com.project.API.product.Product;

import java.math.BigDecimal;

public record ProductPageResponseDTO(
    Long id,
    String name,
    int quantity,
    BigDecimal finalPrice,
    BigDecimal priceOriginal,
    BigDecimal priceDiscount,
    String mainImageUrl
) {
    public static ProductPageResponseDTO from(Product product){
        return new ProductPageResponseDTO(
                product.getId(),
                product.getName(),
                product.getQuantity(),
                product.getFinalPrice(),
                product.getPriceOriginal(),
                product.getPriceDiscount(),
                product.getMainImage().getUrl()
        );
    }
}
