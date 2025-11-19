package com.ofs_160.webdev.ExceptionHandler;


public class CustomerNotFoundException extends RuntimeException {
    public CustomerNotFoundException(String errorMessage) {
        super(errorMessage);
    }
}