package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.DeliveryCar;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DeliveryController {

    @Autowired
    DeliveryService deliveryService;

    @PostMapping("/delivery/{orderId}/{carId}")
    public ResponseEntity<Order> moveOrder(@PathVariable Long orderId, @PathVariable Long carId)
    {

        // check if weight in car is less then x amount
        Order movedOrder = deliveryService.moveOrder(orderId, carId);

        return ResponseEntity.ok(movedOrder);

    }


    @GetMapping("/loaded/{carId}")
    public ResponseEntity<List<Order>> getOrdersInCar(@PathVariable int carId)
    {

        List<Order> orders = deliveryService.getOrderByCarId(carId);

        if (orders.isEmpty())
        {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(orders);

    }


    @PostMapping("/create/car")
    public ResponseEntity<DeliveryCar> createCar()
    {

        DeliveryCar newCar = deliveryService.createDeliveryCar();
        return ResponseEntity.ok(newCar);

    }


}
