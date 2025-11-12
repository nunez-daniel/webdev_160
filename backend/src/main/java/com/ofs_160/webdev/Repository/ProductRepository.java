package com.ofs_160.webdev.Repository;

import com.ofs_160.webdev.Model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.name = :name")
    Product findByNameWithLock(@Param("name") String name);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    Product findByName(String name);

    // Primary search: exact/partial + phonetic match
    @Query(value = """
      SELECT * FROM product p
      WHERE 
        LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
        OR SOUNDEX(p.name) = SOUNDEX(:q)
      ORDER BY
        CASE 
          WHEN LOWER(p.name) = LOWER(:q) THEN 0
          WHEN LOWER(p.name) LIKE LOWER(CONCAT(:q, '%')) THEN 1
          WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) THEN 2
          ELSE 3
        END,
        p.stock DESC
      LIMIT :limit OFFSET :offset
      """,
            nativeQuery = true)
    List<Product> smartSearch(@Param("q") String q,
                              @Param("limit") int limit,
                              @Param("offset") int offset);

    @Query(value = """
      SELECT COUNT(*) FROM product p
      WHERE 
        LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
        OR SOUNDEX(p.name) = SOUNDEX(:q)
      """, nativeQuery = true)
    long smartSearchCount(@Param("q") String q);

    // Lightweight suggest results for typeahead (top 10)
    @Query(value = """
      SELECT p.id, p.name 
      FROM product p
      WHERE 
        LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
        OR SOUNDEX(p.name) = SOUNDEX(:q)
      ORDER BY p.stock DESC, p.name ASC
      LIMIT 10
      """, nativeQuery = true)
    List<Object[]> suggest(@Param("q") String q);

}