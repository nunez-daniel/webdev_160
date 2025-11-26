package com.ofs_160.webdev.Model;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
public class DeliveryCar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name; // e.g., "Robot"

    private String status; // "IDLE", "IN_DELIVERY", "RETURNING"

    @OneToMany(mappedBy = "deliveryCar", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnoreProperties({"deliveryCar"}) // Ignore deliveryCar in orders to prevent circular reference
    private List<Order> assignedOrders;

}


