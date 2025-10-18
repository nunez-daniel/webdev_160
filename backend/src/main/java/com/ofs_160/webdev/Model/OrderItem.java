package com.ofs_160.webdev.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;
    private Long quantity;
    private BigDecimal unitPrice;
    private Long productId;

    // NTS: get whole product as well using id

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
}