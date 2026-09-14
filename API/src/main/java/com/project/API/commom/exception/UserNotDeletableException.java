package com.project.API.commom.exception;

// Conta que não pode ser apagada pelo painel admin: ainda tem carrinho ou
// pedido atrelado, ou é a própria conta do admin que fez a requisição.
public class UserNotDeletableException extends RuntimeException {
    public UserNotDeletableException(String message) {
        super(message);
    }
}
