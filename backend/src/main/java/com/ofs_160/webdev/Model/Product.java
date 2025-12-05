package com.ofs_160.webdev.Model;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;    
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Cost is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Cost must be zero or positive")
    private BigDecimal cost;

    @Min(value = 0, message = "Stock cannot be negative")
    private int stock;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Weight must be zero or positive")
    private BigDecimal weight;
    
    private boolean active = true;

    /*private String imageName;
    private String imageType;

    @Lob
    private byte[] imageData;
*/
    private String imageUrl;

}
