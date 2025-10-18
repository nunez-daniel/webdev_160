package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
