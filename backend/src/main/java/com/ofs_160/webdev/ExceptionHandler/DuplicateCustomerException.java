package com.ofs_160.webdev.ExceptionHandler;


public class DuplicateCustomerException extends RuntimeException {
    public DuplicateCustomerException(String errorMessage) {
        super(errorMessage);
    }
}