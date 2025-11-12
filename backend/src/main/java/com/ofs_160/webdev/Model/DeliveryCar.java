package com.ofs_160.webdev.Model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
public class DeliveryCar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @OneToMany(mappedBy = "deliveryCar", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonManagedReference("car_orders")
    private List<Order> assignedOrders;

}


