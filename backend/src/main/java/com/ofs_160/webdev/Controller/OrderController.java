package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;


@RestController
public class OrderController {

    @Autowired
    private OrderService orderService;

    private static final int MAX_RETRIES = 5;
    private static final long RETRY_DELAY_MS = 1000;


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
    public ResponseEntity<List<Order>> getAllOrdersStatus(@RequestParam(value = "status", defaultValue = "PAID") String status)
    {

        List<Order> orders = orderService.getAllOrdersStatus(status);

        if (orders.isEmpty())
        {
            // temp build also need to check emails exists although ofc they should be logged in
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/order-status")
    public ResponseEntity<String> getOrderStatus(@RequestParam("session_id") String sessionId) {

        Order order = null;
        int attempt = 0;

        while (order == null && attempt < MAX_RETRIES) {
            try {
                // Check if a permanent order was created in the database
                order = orderService.findByStripeSessionId(sessionId);

                if (order == null) {
                    attempt++;
                    System.out.println("Order not found on attempt " + attempt + ". Waiting " + RETRY_DELAY_MS + "ms for webhook to complete.");
                    Thread.sleep(RETRY_DELAY_MS);
                }
            } catch (InterruptedException e) {
                // Restore interrupted status
                Thread.currentThread().interrupt(); 
                System.err.println("Thread interrupted during order status wait: " + e.getMessage());
                break; // Exit the loop on interrupt
            }
        }

        if (order == null) {
 
            System.err.println("Order not found for session ID " + sessionId + " after " + MAX_RETRIES + " attempts. Redirecting to failure page.");
            
            return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                    .header("Location", "http://localhost:5173/stock-insufficient")
                    .build();
        } else {
            // Order found! The webhook completed successfully.
            return ResponseEntity.status(HttpStatus.TEMPORARY_REDIRECT)
                    .header("Location", "http://localhost:5173/order-history")
                    .build();
        }
    }








}