package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.DeliveryCar;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Repository.DeliveryRepository;
import com.ofs_160.webdev.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.ofs_160.webdev.ExceptionHandler.OrderNotFoundException;
import com.ofs_160.webdev.ExceptionHandler.DeliveryCarNotFoundException;


import java.util.List;

@Service
public class DeliveryService {

    @Autowired
    DeliveryRepository deliveryRepository;

    @Autowired
    OrderRepository orderRepository;

    public Order moveOrder(Long orderId, Long carId) {

        // TODO... Error handling
        Order order = orderRepository.findById(Math.toIntExact(orderId))
                .orElseThrow(() -> new OrderNotFoundException(Long.toString(orderId)));

        // This line throws the exception if deliveryCarId is invalid
        DeliveryCar deliveryCar = deliveryRepository.findById(Math.toIntExact(carId))
                .orElseThrow(() -> new DeliveryCarNotFoundException(carId));
        order.setDeliveryCar(deliveryCar);

        order.setPaymentStatus("In car now");

        return  orderRepository.save(order);




    }


    public List<Order> getOrderByCarId(int carId) {

        return orderRepository.findByDeliveryCar_Id(carId);

    }

    public DeliveryCar createDeliveryCar() {

        DeliveryCar newCar = new DeliveryCar();

        return deliveryRepository.save(newCar);
    }
}
