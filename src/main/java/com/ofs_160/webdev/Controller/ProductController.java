package com.ofs_160.webdev.Controller;


import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
public class ProductController {

    @Autowired
    ProductService productService;

    // Need... Implement ResponseEntity to return 200 or 404
    @GetMapping("/product")
    public ResponseEntity<List<Product>> getProducts()
    {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
    }

    @GetMapping("/product/{id}")
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

    @PostMapping("/product-manager-access")
    public ResponseEntity<String> insertProduct(@RequestBody Product product)
    {
        productService.insertProduct(product);
        return new ResponseEntity<>("Product Saved", HttpStatus.CREATED);
    }

    @PutMapping("/product-manager-access")
    public ResponseEntity<String> updateProduct(@RequestBody Product product)
    {

        Product p = productService.findProductById(product.getProduct_id());
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
}
