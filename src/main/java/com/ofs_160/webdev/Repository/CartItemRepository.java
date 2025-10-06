package com.ofs_160.webdev.Repository;


import com.ofs_160.webdev.Model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
}
