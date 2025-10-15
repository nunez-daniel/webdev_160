package com.ofs_160.webdev.DTO;

import com.ofs_160.webdev.Model.Product;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDTO {

    private String id;
    private String name;
    private BigDecimal cost;
    private String imageUrl;
    private BigDecimal weight;
    private int stock;

    public ProductDTO(Product product)
    {
        // String in frontend
        this.id = String.valueOf(product.getId());
        this.name = product.getName();
        this.cost = product.getCost();
        this.weight = product.getWeight();
        this.stock = product.getStock();
        // this.imageUrl = "http://localhost:8080/products/" + product.getId() + "/image";
    }
}