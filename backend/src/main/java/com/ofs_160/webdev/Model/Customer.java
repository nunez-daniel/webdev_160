package com.ofs_160.webdev.Model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int customer_id;

    private String full_name;
    //private String last_name;
    private String email;
    // private String phone_number;

    @Column(unique = true)
    private String username;

    private String password;
    private String role;

}
