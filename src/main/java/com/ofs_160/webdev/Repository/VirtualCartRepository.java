package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.VirtualCart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualCartRepository extends JpaRepository<VirtualCart, Integer> {
}
