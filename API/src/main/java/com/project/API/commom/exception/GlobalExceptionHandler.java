package com.project.API.commom.exception;

import com.project.API.cart.exception.InsufficientStockException;
 import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(404, "NOT_FOUND", ex.getMessage(), null));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> handleEntityNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(404, "NOT_FOUND", ex.getMessage(), null));
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<ApiError> handleStock(InsufficientStockException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "INSUFFICIENT_STOCK", ex.getMessage(), null));
    }

    @ExceptionHandler(EmailAlreadyRegisteredException.class)
    public ResponseEntity<ApiError> handleEmailConflict(EmailAlreadyRegisteredException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(409, "EMAIL_ALREADY_REGISTERED", ex.getMessage(), null));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleDuplicateResource(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(409, "DUPLICATE_RESOURCE", ex.getMessage(), null));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(401, "INVALID_CREDENTIALS", ex.getMessage(), null));
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ApiError> handleStorage(StorageException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError(500, "STORAGE_ERROR", ex.getMessage(), null));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleValidation(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "INVALID_ARGUMENT", ex.getMessage(), null));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .findFirst()
                .map(v -> v.getPropertyPath() + " " + v.getMessage())
                .orElse("Validation failed");
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "VALIDATION_ERROR", message, null));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleConflict(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(409, "CONFLICT", "Resource already exists", null));
    }

    @ExceptionHandler(CartInconsistencyException.class)
    public ResponseEntity<ApiError> handleInconsistency(CartInconsistencyException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(409, "INSUFFICIENT_STOCK", "Product missing on stock", ex.getProducts()));
    }

    @ExceptionHandler(ShippingAddressRequiredException.class)
    public ResponseEntity<ApiError> handleShippingAddress(ShippingAddressRequiredException ex){
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "ADDRESS_REQUIRED", ex.getMessage(), null));
    }

    @ExceptionHandler(OrderNotPayableException.class)
    public ResponseEntity<ApiError> handleOrderNotPayable(OrderNotPayableException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ApiError(409, "ORDER_NOT_PAYABLE", ex.getMessage(), null));
    }

    @ExceptionHandler(InvalidWebhookSignatureException.class)
    public ResponseEntity<ApiError> handleInvalidWebhookSignature(InvalidWebhookSignatureException ex){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(401, "INVALID_WEBHOOK_SIGNATURE", ex.getMessage(), null));
    }

    // @Valid failure on a @RequestBody / @ModelAttribute argument. Without this the
    // client gets Spring's default error body instead of the ApiError shape used
    // everywhere else.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleInvalidBody(MethodArgumentNotValidException ex) {
        List<String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + " " + e.getDefaultMessage())
                .collect(Collectors.toList());
        String message = fieldErrors.isEmpty() ? "Validation failed" : fieldErrors.get(0);
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "VALIDATION_ERROR", message, fieldErrors));
    }

    // @Validated failure on a method parameter (e.g. the @NotNull @RequestParam in
    // ProductController.UploadImages).
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiError> handleInvalidParams(HandlerMethodValidationException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "VALIDATION_ERROR", "Validation failed", null));
    }

    // An authenticated user hitting an endpoint their role does not allow. Spring's
    // default turns this into a 500 once a @RestControllerAdvice is in play.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiError(403, "FORBIDDEN", "Access denied", null));
    }

    // ── Spring MVC's own exceptions ──────────────────────────────────────────
    // These carry a correct status of their own. They are listed explicitly so
    // the catch-all below cannot turn a 404/405/400 into a 500, and so they come
    // back in the same ApiError shape as everything else.

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<ApiError> handleNoRoute(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(404, "NOT_FOUND", "No endpoint for this request", null));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(new ApiError(405, "METHOD_NOT_ALLOWED", ex.getMessage(), null));
    }

    // Malformed or unparseable JSON body.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "MALFORMED_REQUEST", "Request body is missing or malformed", null));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "MISSING_PARAMETER", ex.getMessage(), null));
    }

    // e.g. /product/not-a-number where the handler expects a Long.
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiError(400, "INVALID_PARAMETER",
                        "Invalid value for '" + ex.getName() + "'", null));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleUploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(new ApiError(413, "PAYLOAD_TOO_LARGE", "Upload exceeds the maximum allowed size", null));
    }

    // Safety net for any other Spring exception that already knows its status,
    // so it keeps that status instead of falling through to the 500 below.
    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<ApiError> handleErrorResponse(ErrorResponseException ex) {
        int status = ex.getStatusCode().value();
        return ResponseEntity.status(status)
                .body(new ApiError(status, "REQUEST_ERROR", ex.getBody().getTitle(), null));
    }

    // Catch-all. Without it an unmapped exception escapes as a stack trace in the
    // response body; here it is logged server-side and the client gets nothing
    // sensitive.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError(500, "INTERNAL_ERROR", "Unexpected server error", null));
    }

}
