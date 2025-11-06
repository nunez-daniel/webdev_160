package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;


@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;


    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getMyOrders(Principal principal)
    {
        String principalName = principal.getName();
        List<Order> orders = orderService.getOrders(principalName);

        if (orders.isEmpty())
        {
            // temp build also need to check emails exists although ofc they should be logged in
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }



    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrdersById(Principal principal, @PathVariable Long orderId)
    {

        String principalName = principal.getName();
        Order order = orderService.getOrderByNameAndId(principalName, orderId);

        if (order == null)
        {
            // need to handle error code to attempt to reach other users orders
            // temp build also need to check emails exists although ofc they should be logged in
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(order);
    }


    // mangers only
    @GetMapping("/orders-all")
    public ResponseEntity<List<Order>> getAllOrders()
    {

        List<Order> orders = orderService.getAllOrders();

        if (orders.isEmpty())
        {
            // temp build also need to check emails exists although ofc they should be logged in
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }



    @GetMapping("/orders-all-status")
    public ResponseEntity<List<Order>> getAllOrdersStatus()
    {

        List<Order> orders = orderService.getAllOrdersStatus("PAID");

        if (orders.isEmpty())
        {
            // temp build also need to check emails exists although ofc they should be logged in
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }

}
