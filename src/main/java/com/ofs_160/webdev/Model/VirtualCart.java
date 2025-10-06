package com.ofs_160.webdev.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(exclude = {"customer", "itemsInCart"})
public class VirtualCart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "virtual_cart_id")
    private int virtual_cart_id;

    private BigDecimal vcart_total;

    private BigDecimal vcart_weight;

    @OneToOne
    @JoinColumn(name = "customer_id")
    @JsonBackReference
    private Customer customer;

    @OneToMany(mappedBy = "virtualCart", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<CartItem> itemsInCart = new HashSet<>();



}
