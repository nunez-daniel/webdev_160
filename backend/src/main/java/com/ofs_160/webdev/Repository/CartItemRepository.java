package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.CartItem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    @Transactional
    void deleteByProductId(int id);

}
