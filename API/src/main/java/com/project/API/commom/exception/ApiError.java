package com.project.API.commom.exception;

    public record ApiError(int status, String code, String message, Object details) {
}
