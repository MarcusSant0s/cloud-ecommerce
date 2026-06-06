package com.project.API.commom.exception;

import com.project.API.order.DTO.MissingProducts;

import java.util.List;

public class CartInconsistencyException extends RuntimeException {
    public CartInconsistencyException(String message, List<MissingProducts> products
    ) {
        super(message);
        this.products = products;

    }

    private final List<MissingProducts> products;

    public List<MissingProducts> getProducts() {
        return products;
    }
}
