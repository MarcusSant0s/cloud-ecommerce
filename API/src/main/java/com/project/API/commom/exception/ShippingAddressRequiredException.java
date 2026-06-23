package com.project.API.commom.exception;

public class ShippingAddressRequiredException extends RuntimeException {
    public ShippingAddressRequiredException(String message) {
        super(message);
    }
}
