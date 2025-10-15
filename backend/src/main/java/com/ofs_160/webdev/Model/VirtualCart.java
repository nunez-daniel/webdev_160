package com.ofs_160.webdev.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
//@EqualsAndHashCode(exclude = {"customer", "itemsInCart"})
@AllArgsConstructor
@NoArgsConstructor
@Data
public class VirtualCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "virtual_cart_id")
    private int virtual_cart_id;

    private BigDecimal subtotal;

    private BigDecimal weight;


    private boolean under_twenty_lbs;

    @OneToOne
    @JoinColumn(name = "customer_id")
    @EqualsAndHashCode.Exclude
    @JsonBackReference
    private Customer customer;

    @OneToMany(mappedBy = "virtualCart", orphanRemoval = true,cascade = CascadeType.ALL)
    @EqualsAndHashCode.Exclude
    @JsonManagedReference
    @OrderBy("cart_item_id ASC")
    private List<CartItem> itemsInCart = new ArrayList<>();



}
