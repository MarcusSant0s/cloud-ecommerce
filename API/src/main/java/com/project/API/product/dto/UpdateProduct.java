package com.project.API.product.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

// Partial update: every field is optional (null == "leave unchanged"), so the
// constraints below only fire on values that were actually supplied.
public record UpdateProduct(
        String name,
        String description,
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal priceOriginal,
        @DecimalMin("0.01")
        @DecimalMax("0.9")
        BigDecimal priceDiscount,
        @PositiveOrZero
        Integer quantity,
        String categoryIds,
        String collectionIds,
        List<MultipartFile> files
) {
}
