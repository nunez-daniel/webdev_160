package com.ofs_160.webdev.ExceptionHandler;


public class CustomerNotFoundException extends ResourceNotFoundException {
    public CustomerNotFoundException(String username) {
        super("Customer not found with username: " + username);
    }
}