package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;


@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void whenSaveAndFindById_thenProductShouldBeFound() {

        Product newProduct = new Product(
                0, 
                "Widget Alpha",
                new BigDecimal("5.99"),
                50,
                new BigDecimal("0.1"),
                "widget.png",
                "image/png",
                new byte[]{4, 5, 6}
        );

        
        Product savedProduct = productRepository.save(newProduct);
        Optional<Product> foundProduct = productRepository.findById(savedProduct.getId());

       
        assertTrue(foundProduct.isPresent());
        assertEquals("Widget Alpha", foundProduct.get().getName());
      
        assertNotEquals(0, savedProduct.getId());
    }

    @Test
    void whenFindAll_thenShouldReturnAllProducts() {
        
        entityManager.persist(new Product(0, "A", BigDecimal.ONE, 1, BigDecimal.ZERO, null, null, null));
        entityManager.persist(new Product(0, "B", BigDecimal.TEN, 10, BigDecimal.ZERO, null, null, null));
        entityManager.flush();

       
        List<Product> products = productRepository.findAll();

        
        assertEquals(2, products.size());
        assertEquals("A", products.get(0).getName());
    }

    @Test
    void whenDeleteById_thenProductShouldBeDeleted() {
        
        Product productToDelete = entityManager.persistAndFlush(
                new Product(0, "Temp Item", BigDecimal.ONE, 1, BigDecimal.ZERO, null, null, null)
        );

      
        productRepository.deleteById(productToDelete.getId());

        
        Optional<Product> result = productRepository.findById(productToDelete.getId());
        assertFalse(result.isPresent());
    }
}