package com.ofs_160.webdev.Service;


import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ofs_160.webdev.ExceptionHandler.CustomerNotFoundException;
import com.ofs_160.webdev.ExceptionHandler.OrderNotFoundException;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;


    public List<Order> getOrders(String principalName) {
        Customer customer = customerRepository.findByEmail(principalName)
            .orElseThrow(() -> new CustomerNotFoundException(principalName));

        return orderRepository.findByCustomer(customer);
    }

    public Order getOrderByNameAndId(String principalName, Long orderId) {

        return orderRepository.findByIdAndCustomerUsername(orderId, principalName)
            .orElseThrow(() -> new OrderNotFoundException(
            Long.toString(orderId)
        ));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getAllOrdersStatus(String status) {

        return orderRepository.findByPaymentStatus(status);
    }

    public Order findByStripeSessionId(String sessionId) {
        return orderRepository.findByStripeSessionId(sessionId)
            .orElseThrow(() -> new OrderNotFoundException(sessionId));
    }
}
