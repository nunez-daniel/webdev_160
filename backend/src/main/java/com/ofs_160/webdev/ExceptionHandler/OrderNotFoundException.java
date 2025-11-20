package com.ofs_160.webdev.ExceptionHandler;

public class OrderNotFoundException extends ResourceNotFoundException {
  public OrderNotFoundException(string orderId) {
        super("Order not found with ID: " + orderId);
    }
}
