package com.ofs_160.webdev.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@EqualsAndHashCode(exclude = {"virtualCart"})
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int customer_id;

    private String first_name;
    private String last_name;
    private String email;
    // private String phone_number;

    @Column(unique = true)
    private String username;

    private String passcode;
    private String role;



    @OneToOne(mappedBy = "customer",  cascade = CascadeType.ALL)
    @JsonBackReference
    private VirtualCart virtualCart;


}
