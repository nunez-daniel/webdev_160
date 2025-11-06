package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomer(Customer customer);

    Order findByIdAndCustomerUsername(Long id, String customer_username);

    List<Order> findByDeliveryCar_Id(int carId);

    List<Order> findByPaymentStatus(String attr0);
}