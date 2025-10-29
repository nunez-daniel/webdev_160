package com.ofs_160.webdev.Controller;


import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.ProductService;

@RestController
@CrossOrigin(origins = "http://localhost")
public class ProductController {

    @Autowired
    ProductService productService;

    // Need... Implement ResponseEntity to return 200 or 404
    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts()
    {
        return new ResponseEntity<>(productService.getAllProducts(), HttpStatus.OK);
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

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/product-manager-access")
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

    @PostMapping("/products")
    public ResponseEntity<?> addProductImage(@RequestPart Product product, @RequestPart MultipartFile imageFile) {
        try {
            Product productImage = productService.addProductImage(product, imageFile);
            return new ResponseEntity<>(productImage, HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INSUFFICIENT_STORAGE);
        }
    }

    @GetMapping("products/{productId}/image")
    public ResponseEntity<byte[]> getImageByProductId(@PathVariable int productId)
    {
        Product product = productService.findProductById(productId);

        if(product.getId() > 0)
        {
            return new ResponseEntity<>(product.getImageData(), HttpStatus.OK);
        }
        else
        {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }
}
