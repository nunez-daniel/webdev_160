package com.ofs_160.webdev.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import com.ofs_160.webdev.DTO.ErrorResponse;
import org.springframework.dao.DataAccessException;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = new ErrorResponse("INVALID_REQUEST", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(InsufficientStockException.class)
    public ResponseEntity<?> handleInsufficientStock(InsufficientStockException ex) {
        Map<String, Object> errorDetails = Map.of(
            "error", "Not enough stock",
            "message", ex.getMessage(),
            "available", ex.getAvailableStock()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccessException(DataAccessException ex) {
        System.err.println("Database Access Error: " + ex.getMessage()); 
        
        ErrorResponse error = new ErrorResponse("DB_OPERATION_FAILED", 
                                      "An error occurred while processing the request against the database.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error); 
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllUncaughtErrors(Exception ex) {
        System.err.println("UNCAUGHT SERVER ERROR: " + ex.getMessage());
        ex.printStackTrace();
        
        ErrorResponse error = new ErrorResponse("UNEXPECTED_ERROR", 
                                                "An unexpected error occurred. Please contact support.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error); 
    }

}