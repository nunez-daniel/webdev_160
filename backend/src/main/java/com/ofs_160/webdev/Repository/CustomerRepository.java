package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Customer findByUsername(String username);
    Customer findByEmail(String email);
}
