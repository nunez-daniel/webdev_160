package com.ofs_160.webdev.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StripeProductRequest {
    private Long amount;
    private Long quantity;
    private String name;
    private String currency;
}
