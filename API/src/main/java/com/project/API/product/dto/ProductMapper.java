package com.project.API.product.dto;

import com.project.API.product.Product;

public class ProductMapper {
    public static Product toEntity(CreateProduct dto){



        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setQuantity(dto.getQuantity());
        product.setPriceOriginal(dto.getPriceOriginal());
        product.setPriceDiscount(dto.getPriceDiscount());

        return product;
    }
}
