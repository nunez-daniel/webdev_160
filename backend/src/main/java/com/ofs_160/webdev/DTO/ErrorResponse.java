package com.ofs_160.webdev.DTO;
import lombok.Data;

@Data
public class ErrorResponse {
    private String errorCode;
    private String message;
    
    public ErrorResponse(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
    }
    
}