package com.project.API.product.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductFilterDTO(
         Long categoryId,
         String name,
         BigDecimal minPrice,
         BigDecimal maxPrice,
         Boolean inStock
) {
}
