package com.ofs_160.webdev.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private BigDecimal cost;
    private int stock;
    private BigDecimal weight;
    // private String image_url;



    private String imageName;
    private String imageType;

    // private String imageUrl;

    @Lob
    private byte[] imageData;

}
