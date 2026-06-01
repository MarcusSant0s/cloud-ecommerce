package com.project.API.commom.exception;

import com.project.API.cart.exception.InsufficientStockException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InsufficientStockException.class)
        public ResponseEntity<ApiError> handleStock(
                InsufficientStockException ex
        ){
            ApiError error = new ApiError(400, "INSUFFICIENT_STOCK", ex.getMessage());
            return ResponseEntity.badRequest()
                    .body(error);
        }
}
