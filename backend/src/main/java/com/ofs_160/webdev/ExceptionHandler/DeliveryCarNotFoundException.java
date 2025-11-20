package com.ofs_160.webdev.ExceptionHandler;

public class DeliveryCarNotFoundException extends ResourceNotFoundException{
  public DeliveryCarNotFoundException(Long carId) {
        super("Delivery Car not found with ID: " + carId);
    }
}
