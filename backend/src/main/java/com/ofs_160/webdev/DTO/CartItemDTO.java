package com.ofs_160.webdev.DTO;

import com.ofs_160.webdev.Model.CartItem;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDTO {

    private String id;
    private String name;
    private BigDecimal price;
    private int qty;
    private String imageUrl;
    private String brand;
    private String category;

    public CartItemDTO(CartItem item)
    {
        // String in frontend
        this.id = String.valueOf(item.getProduct().getId());
        this.name = item.getProduct().getName();
        this.price = item.getProduct().getCost();
        this.qty = item.getQty();
        this.imageUrl = "http://localhost:8080/products/" + item.getCart_item_id() + "/image";
    }
}