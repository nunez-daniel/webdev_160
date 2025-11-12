package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.DeliveryCar;
import org.springframework.data.jpa.repository.JpaRepository;


public interface DeliveryRepository extends JpaRepository<DeliveryCar, Integer> {
}
