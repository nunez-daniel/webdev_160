package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Config.SecurityConfig;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService; 
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Load only the ProductController and the necessary SecurityConfig
@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class) 
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService; 

    @MockBean
    private UserDetailsService userDetailsService; 

    @Autowired
    private ObjectMapper objectMapper;

    private Product product1;

    @BeforeEach
    void setUp() {
        product1 = new Product();
        product1.setId(1);
        product1.setName("Test Product");
        product1.setCost(new BigDecimal("9.99"));
        
        product1.setImageData(new byte[]{1, 2, 3});
    }

    
    // PUBLIC ENDPOINT TESTS (No Authentication Required)
    

    @Test
    void getProducts_ShouldReturnOk_AndListOfProducts() throws Exception {
        
        List<Product> products = Collections.singletonList(product1);
        when(productService.getAllProducts()).thenReturn(products);

       
        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1));

        verify(productService).getAllProducts();
    }

    @Test
    void getProductById_ExistingId_ShouldReturnProduct() throws Exception {
        
        when(productService.findProductById(1)).thenReturn(product1);

        
        mockMvc.perform(get("/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Product"));

        verify(productService).findProductById(1);
    }

    @Test
    void getProductById_NonExistingId_ShouldReturn404() throws Exception {
   
        when(productService.findProductById(99)).thenReturn(null);

       
        mockMvc.perform(get("/products/99"))
                .andExpect(status().isNotFound()); 

        verify(productService).findProductById(99);
    }

    // ADMIN ENDPOINT TESTS

    @Test
    @WithMockUser(authorities = "ADMIN")
    void insertProduct_WithAdminRole_ShouldReturn201Created() throws Exception {

        doNothing().when(productService).insertProduct(any(Product.class));


        mockMvc.perform(post("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isCreated()) 
                .andExpect(content().string("Product Saved"));

        verify(productService).insertProduct(any(Product.class));
    }

    @Test
    @WithMockUser(authorities = "CUSTOMER")
    void insertProduct_WithNonAdminRole_ShouldReturn403Forbidden() throws Exception {
      
        mockMvc.perform(post("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isForbidden()); 
        
        verify(productService, never()).insertProduct(any());
    }

    @Test
    void insertProduct_WithoutAuthentication_ShouldRedirect() throws Exception {
      
        mockMvc.perform(post("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().is3xxRedirection()); 

        verify(productService, never()).insertProduct(any());
    }

    
    // UPDATE/DELETE TESTS
    
    @Test
    @WithMockUser(authorities = "ADMIN")
    void updateProduct_ExistingProduct_ShouldReturn200Ok() throws Exception {
        
        when(productService.findProductById(1)).thenReturn(product1);
        doNothing().when(productService).updateProduct(any(Product.class));

        
        mockMvc.perform(put("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Updated"));

        verify(productService).updateProduct(any(Product.class));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteProductById_ExistingProduct_ShouldReturn200Ok() throws Exception {
        
        when(productService.findProductById(1)).thenReturn(product1);
        doNothing().when(productService).deleteProductById(1);

        
        mockMvc.perform(delete("/product-manager-access/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Deleted"));

        verify(productService).deleteProductById(1);
    }
}