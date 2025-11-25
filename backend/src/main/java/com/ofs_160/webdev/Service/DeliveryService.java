package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.DeliveryCar;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Repository.DeliveryRepository;
import com.ofs_160.webdev.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private static final int MAX_ORDERS_PER_CAR = 10;
    private static final String ROBOT_CAR_NAME = "Robot";

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    OrderRepository orderRepository;

    public Order moveOrder(Long orderId, Long carId) {
        Order order = orderRepository.findById(Math.toIntExact(orderId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with ID: " + orderId));

        DeliveryCar deliveryCar = deliveryRepository.findById(Math.toIntExact(carId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery Car not found with ID: " + carId));

        // Check if car is already in delivery (can't assign new orders while in delivery)
        if ("IN_DELIVERY".equals(deliveryCar.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot assign orders to car that is already in delivery. Wait for current delivery to complete.");
        }

        // Check capacity limit (max 10 orders)
        List<Order> currentOrders = orderRepository.findByDeliveryCar_Id(Math.toIntExact(carId));
        long activeOrders = currentOrders.stream()
                .filter(o -> o.getPaymentStatus() != null && 
                        (o.getPaymentStatus().equals("ASSIGNED") || o.getPaymentStatus().equals("In car now")))
                .count();

        if (activeOrders >= MAX_ORDERS_PER_CAR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Delivery car has reached maximum capacity of " + MAX_ORDERS_PER_CAR + " orders.");
        }

        order.setDeliveryCar(deliveryCar);
        order.setPaymentStatus("ASSIGNED");

        return orderRepository.save(order);
    }

    public List<Order> getOrderByCarId(int carId) {
        return orderRepository.findByDeliveryCar_Id(carId);
    }

    public DeliveryCar createDeliveryCar() {
        DeliveryCar newCar = new DeliveryCar();
        newCar.setName(ROBOT_CAR_NAME);
        newCar.setStatus("IDLE");
        return deliveryRepository.save(newCar);
    }

    public DeliveryCar getOrCreateRobotCar() {
        List<DeliveryCar> cars = deliveryRepository.findAll();
        DeliveryCar robotCar = cars.stream()
                .filter(car -> ROBOT_CAR_NAME.equals(car.getName()))
                .findFirst()
                .orElse(null);

        if (robotCar == null) {
            robotCar = createDeliveryCar();
        }

        return robotCar;
    }

    public DeliveryCar startDelivery(int carId, List<Long> orderIds) {
        DeliveryCar deliveryCar = deliveryRepository.findById(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery Car not found with ID: " + carId));

        if (orderIds == null || orderIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No orders selected for delivery.");
        }

        // Update car status
        deliveryCar.setStatus("IN_DELIVERY");

        // Update selected orders to IN_DELIVERY status
        for (Long orderId : orderIds) {
            Order order = orderRepository.findById(Math.toIntExact(orderId))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with ID: " + orderId));
            
            // Verify order is assigned to this car
            if (order.getDeliveryCar() == null || order.getDeliveryCar().getId() != carId) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order " + orderId + " is not assigned to this delivery car.");
            }
            
            if (order.getPaymentStatus().equals("ASSIGNED")) {
                order.setPaymentStatus("IN_DELIVERY");
                orderRepository.save(order);
            }
        }

        deliveryRepository.save(deliveryCar);
        return deliveryCar;
    }

    public DeliveryCar stopDelivery(int carId) {
        DeliveryCar deliveryCar = deliveryRepository.findById(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery Car not found with ID: " + carId));

        if (!"IN_DELIVERY".equals(deliveryCar.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery car is not currently in delivery.");
        }

        // Get all orders assigned to this car
        List<Order> assignedOrders = orderRepository.findByDeliveryCar_Id(carId);
        
        // Change orders from IN_DELIVERY back to ASSIGNED
        for (Order order : assignedOrders) {
            if (order.getPaymentStatus() != null && order.getPaymentStatus().equals("IN_DELIVERY")) {
                order.setPaymentStatus("ASSIGNED");
                orderRepository.save(order);
            }
        }

        // Change car status back to IDLE
        deliveryCar.setStatus("IDLE");
        deliveryRepository.save(deliveryCar);
        return deliveryCar;
    }

    public List<Order> autoAssignOrders() {
        // Get robot car (create if doesn't exist)
        DeliveryCar robotCar = getOrCreateRobotCar();

        // Check if robot is already in delivery
        if ("IN_DELIVERY".equals(robotCar.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Robot is already in delivery. Wait for current delivery to complete before assigning new orders.");
        }

        // Get current assigned orders count
        List<Order> currentOrders = orderRepository.findByDeliveryCar_Id(robotCar.getId());
        long activeOrders = currentOrders.stream()
                .filter(o -> o.getPaymentStatus() != null && 
                        (o.getPaymentStatus().equals("ASSIGNED") || o.getPaymentStatus().equals("In car now")))
                .count();

        int availableSlots = MAX_ORDERS_PER_CAR - (int)activeOrders;
        if (availableSlots <= 0) {
            return currentOrders; // No available slots
        }

        // Get unassigned orders (PAID status, no delivery car)
        List<Order> unassignedOrders = orderRepository.findByPaymentStatus("PAID")
                .stream()
                .filter(order -> order.getDeliveryCar() == null)
                .filter(order -> order.getShippingAddressLine1() != null && !order.getShippingAddressLine1().trim().isEmpty())
                .sorted((o1, o2) -> o1.getOrderDate().compareTo(o2.getOrderDate())) // FIFO: oldest first
                .collect(java.util.stream.Collectors.toList());

        if (unassignedOrders.isEmpty()) {
            return currentOrders;
        }

        // Cluster and select up to availableSlots orders
        List<Order> selectedOrders = clusterAndSelectOrders(unassignedOrders, availableSlots);

        // Assign selected orders to robot car
        for (Order order : selectedOrders) {
            order.setDeliveryCar(robotCar);
            order.setPaymentStatus("ASSIGNED");
            orderRepository.save(order);
        }

        return orderRepository.findByDeliveryCar_Id(robotCar.getId());
    }

    private List<Order> clusterAndSelectOrders(List<Order> orders, int maxOrders) {
        if (orders.size() <= maxOrders) {
            return orders;
        }

        // Simple clustering: group orders by proximity
        // For now, use a simple approach: take first maxOrders orders sorted by time
        // In a real implementation, you'd calculate distances and cluster geographically
        
        // Simple geographic clustering based on city/state (group nearby addresses)
        java.util.Map<String, List<Order>> clusters = new java.util.HashMap<>();
        for (Order order : orders) {
            String key = (order.getShippingCity() != null ? order.getShippingCity() : "") + 
                        "_" + (order.getShippingState() != null ? order.getShippingState() : "");
            clusters.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(order);
        }

        // Sort clusters by size (larger clusters first) and order time
        List<List<Order>> sortedClusters = clusters.values().stream()
                .sorted((c1, c2) -> {
                    int sizeCompare = Integer.compare(c2.size(), c1.size());
                    if (sizeCompare != 0) return sizeCompare;
                    // If same size, compare earliest order time
                    return c1.get(0).getOrderDate().compareTo(c2.get(0).getOrderDate());
                })
                .collect(java.util.stream.Collectors.toList());

        // Select orders from clusters until we reach maxOrders
        List<Order> selected = new java.util.ArrayList<>();
        for (List<Order> cluster : sortedClusters) {
            for (Order order : cluster) {
                if (selected.size() >= maxOrders) break;
                selected.add(order);
            }
            if (selected.size() >= maxOrders) break;
        }

        return selected;
    }
}
