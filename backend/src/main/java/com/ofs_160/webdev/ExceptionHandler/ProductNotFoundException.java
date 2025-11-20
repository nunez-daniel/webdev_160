package com.ofs_160.webdev.ExceptionHandler;

public class ProductNotFoundException extends ResourceNotFoundException {
    public ProductNotFoundException(String productName) {
        super("Product is not found: " + productName);
    }
}