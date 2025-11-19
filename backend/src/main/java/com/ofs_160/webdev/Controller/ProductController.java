package com.ofs_160.webdev.Controller;


import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    ProductService productService;





    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts()
    {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }








    // Need... Implement ResponseEntity to return 200 or 404
    @GetMapping("/products2")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(name = "search", required = false) String search) {

        if (search == null || search.isBlank()) {
            // fall back to simple list, first page
            Map<String, Object> data = productService.smartSearch("", page, limit);
            return ResponseEntity.ok(data);
        }
        Map<String, Object> data = productService.smartSearch(search, page, limit);
        return ResponseEntity.ok(data);
    }

    // typeahead suggestions
    @GetMapping("/products2/suggest")
    public ResponseEntity<List<Map<String, Object>>> suggest(@RequestParam("q") String q) {
        return ResponseEntity.ok(productService.suggest(q));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id)
    {

        Product p = productService.findProductById(id);
        if(p == null)
        {
            return ResponseEntity.notFound().build(); // 404
        }else
        {
            return ResponseEntity.ok(p);
        }

    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/product-manager-access/{id}")
    public ResponseEntity<String> deleteProductById(@PathVariable int id)
    {
        Product p = productService.findProductById(id);
        if(p != null)
        {
            productService.deleteProductById(id);
            return new ResponseEntity<>("Product Deleted", HttpStatus.OK);
        } else
        {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/products")
    public ResponseEntity<String> insertProduct(@RequestBody Product product)
    {
        productService.insertProduct(product);
        return new ResponseEntity<>("Product Saved", HttpStatus.CREATED);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/product-manager-access")
    public ResponseEntity<String> updateProduct(@RequestBody Product product)
    {

        Product p = productService.findProductById(product.getId());
        if(p != null)
        {
            productService.updateProduct(product);
            return new ResponseEntity<>("Product Updated", HttpStatus.OK);
        } else
        {
            // No product found to update
            return new ResponseEntity<>("Product NOT Updated", HttpStatus.NOT_FOUND);
        }

    }



    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword)
    {
        return productService.searchProducts(keyword);
    }
}