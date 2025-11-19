package com.ofs_160.webdev.ExceptionHandler;

public class InsufficientStockException extends RuntimeException {
    private final int availableStock;

    public InsufficientStockException(String message, int availableStock) {
        super(message);
        this.availableStock = availableStock;
    }

    public int getAvailableStock() {
        return availableStock;
    }
}
