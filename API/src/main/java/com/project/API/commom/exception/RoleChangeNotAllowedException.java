package com.project.API.commom.exception;

// Troca de papel recusada pelo painel admin — hoje, o admin tentando alterar o
// papel da própria conta.
public class RoleChangeNotAllowedException extends RuntimeException {
    public RoleChangeNotAllowedException(String message) {
        super(message);
    }
}
