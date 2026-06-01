package com.project.API.product.dto;

import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record UpdateProduct(
        String name,
        String description,
        BigDecimal priceOriginal,
        BigDecimal priceDiscount,
        Integer quantity,
        String categoryIds,
        List<MultipartFile> files
) {
}
