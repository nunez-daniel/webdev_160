package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.ProductService;
import com.ofs_160.webdev.Config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.math.BigDecimal;
import java.util.*;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
public class ProductControllerWebLayerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void getProducts_ShouldReturnAllProducts() throws Exception {
        List<Product> products = Arrays.asList(
            createProduct(1L, "Apple", new BigDecimal("5.00"), 10),
            createProduct(2L, "Orange", new BigDecimal("3.00"), 5)
        );

        when(productService.getAllProducts()).thenReturn(products);

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].name", is("Apple")))
                .andExpect(jsonPath("$[0].cost", is(5.00)))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].name", is("Orange")));

        verify(productService).getAllProducts();
    }

    @Test
    void getProducts_WithEmptyList_ShouldReturnOk() throws Exception {
        when(productService.getAllProducts()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(productService).getAllProducts();
    }

    @Test
    void getProducts2_WithoutSearch_ShouldReturnSmartSearchResults() throws Exception {
        Map<String, Object> smartSearchResult = new HashMap<>();
        smartSearchResult.put("items", Arrays.asList(
            createProduct(1L, "Product 1", new BigDecimal("10.00"), 5),
            createProduct(2L, "Product 2", new BigDecimal("20.00"), 10)
        ));
        smartSearchResult.put("total", 2L);
        smartSearchResult.put("corrected", null);

        when(productService.smartSearch("", 1, 12)).thenReturn(smartSearchResult);

        mockMvc.perform(get("/products2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.total", is(2)))
                .andExpect(jsonPath("$.corrected").doesNotExist());

        verify(productService).smartSearch("", 1, 12);
    }

    @Test
    void getProducts2_WithSearchQuery_ShouldReturnFilteredResults() throws Exception {
        Map<String, Object> smartSearchResult = new HashMap<>();
        smartSearchResult.put("items", List.of(createProduct(1L, "Apple", new BigDecimal("5.00"), 10)));
        smartSearchResult.put("total", 1L);
        smartSearchResult.put("corrected", null);

        when(productService.smartSearch("apple", 1, 12)).thenReturn(smartSearchResult);

        mockMvc.perform(get("/products2")
                .param("search", "apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].name", is("Apple")));

        verify(productService).smartSearch("apple", 1, 12);
    }

    @Test
    void getProducts2_WithPagination_ShouldUseCorrectParameters() throws Exception {
        Map<String, Object> smartSearchResult = new HashMap<>();
        smartSearchResult.put("items", Collections.emptyList());
        smartSearchResult.put("total", 0L);
        smartSearchResult.put("corrected", null);

        when(productService.smartSearch("", 2, 20)).thenReturn(smartSearchResult);

        mockMvc.perform(get("/products2")
                .param("page", "2")
                .param("limit", "20"))
                .andExpect(status().isOk());

        verify(productService).smartSearch("", 2, 20);
    }

    @Test
    void suggest_WithQuery_ShouldReturnSuggestions() throws Exception {
        List<Map<String, Object>> suggestions = Arrays.asList(
            Map.of("id", "1", "name", "Apple"),
            Map.of("id", "2", "name", "Pineapple")
        );

        when(productService.suggest("app")).thenReturn(suggestions);

        mockMvc.perform(get("/products2/suggest")
                .param("q", "app"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is("1")))
                .andExpect(jsonPath("$[0].name", is("Apple")))
                .andExpect(jsonPath("$[1].id", is("2")))
                .andExpect(jsonPath("$[1].name", is("Pineapple")));

        verify(productService).suggest("app");
    }

    @Test
    void suggest_WithEmptyQuery_ShouldReturnEmptyList() throws Exception {
        when(productService.suggest("")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/products2/suggest")
                .param("q", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(productService).suggest("");
    }

    @Test
    void getProductById_WithExistingProduct_ShouldReturnProduct() throws Exception {
        Product product = createProduct(1L, "Apple", new BigDecimal("5.00"), 10);
        when(productService.findProductById(1)).thenReturn(product);

        mockMvc.perform(get("/products/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.name", is("Apple")))
                .andExpect(jsonPath("$.cost", is(5.00)))
                .andExpect(jsonPath("$.stock", is(10)));

        verify(productService).findProductById(1);
    }

    @Test
    void getProductById_WithNonExistingProduct_ShouldReturnNotFound() throws Exception {
        when(productService.findProductById(999)).thenReturn(null);

        mockMvc.perform(get("/products/{id}", 999))
                .andExpect(status().isNotFound());

        verify(productService).findProductById(999);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteProductById_WithAdminRoleAndExistingProduct_ShouldDeleteProduct() throws Exception {
        Product product = createProduct(1L, "Apple", new BigDecimal("5.00"), 10);
        when(productService.findProductById(1)).thenReturn(product);
        doNothing().when(productService).deleteProductById(1);

        mockMvc.perform(delete("/product-manager-access/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Deleted"));

        verify(productService).findProductById(1);
        verify(productService).deleteProductById(1);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void deleteProductById_WithAdminRoleAndNonExistingProduct_ShouldReturnNotFound() throws Exception {
        when(productService.findProductById(999)).thenReturn(null);

        mockMvc.perform(delete("/product-manager-access/{id}", 999))
                .andExpect(status().isNotFound());

        verify(productService).findProductById(999);
        verify(productService, never()).deleteProductById(anyInt());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void deleteProductById_WithCustomerRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(delete("/product-manager-access/{id}", 1))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    void deleteProductById_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(delete("/product-manager-access/{id}", 1))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(productService);
    }

    @Test
    void insertProduct_ShouldCreateProduct() throws Exception {
        String productJson = """
            {
                "id": 1,
                "name": "New Product",
                "cost": 15.99,
                "stock": 20,
                "weight": 2.5,
                "imageUrl": "http://example.com/image.jpg"
            }
            """;

        doNothing().when(productService).insertProduct(any(Product.class));

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(productJson))
                .andExpect(status().isCreated())
                .andExpect(content().string("Product Saved"));

        verify(productService).insertProduct(any(Product.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateProduct_WithAdminRoleAndExistingProduct_ShouldUpdateProduct() throws Exception {
        String productJson = """
            {
                "id": 1,
                "name": "Updated Product",
                "cost": 19.99,
                "stock": 15,
                "weight": 2.0,
                "imageUrl": "http://example.com/updated.jpg"
            }
            """;

        Product existingProduct = createProduct(1L, "Old Product", new BigDecimal("10.00"), 10);
        when(productService.findProductById(1)).thenReturn(existingProduct);
        doNothing().when(productService).updateProduct(any(Product.class));

        mockMvc.perform(put("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(productJson))
                .andExpect(status().isOk())
                .andExpect(content().string("Product Updated"));

        verify(productService).findProductById(1);
        verify(productService).updateProduct(any(Product.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void updateProduct_WithAdminRoleAndNonExistingProduct_ShouldReturnNotFound() throws Exception {
        String productJson = """
            {
                "id": 999,
                "name": "Non-existent Product",
                "cost": 10.00,
                "stock": 5
            }
            """;

        when(productService.findProductById(999)).thenReturn(null);

        mockMvc.perform(put("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(productJson))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Product NOT Updated"));

        verify(productService).findProductById(999);
        verify(productService, never()).updateProduct(any(Product.class));
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void updateProduct_WithCustomerRole_ShouldReturnForbidden() throws Exception {
        String productJson = "{\"id\": 1, \"name\": \"Product\"}";

        mockMvc.perform(put("/product-manager-access")
                .contentType(MediaType.APPLICATION_JSON)
                .content(productJson))
                .andExpect(status().isForbidden());

        verifyNoInteractions(productService);
    }

    @Test
    void searchProducts_WithKeyword_ShouldReturnMatchingProducts() throws Exception {
        List<Product> products = List.of(createProduct(1L, "Apple", new BigDecimal("5.00"), 10));
        when(productService.searchProducts("apple")).thenReturn(products);

        mockMvc.perform(get("/search")
                .param("keyword", "apple"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Apple")));

        verify(productService).searchProducts("apple");
    }

    @Test
    void searchProducts_WithEmptyKeyword_ShouldReturnEmptyList() throws Exception {
        when(productService.searchProducts("")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/search")
                .param("keyword", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        verify(productService).searchProducts("");
    }

    @Test
    void publicEndpoints_ShouldBeAccessibleWithoutAuthentication() throws Exception {
        when(productService.getAllProducts()).thenReturn(Collections.emptyList());
        when(productService.smartSearch(anyString(), anyInt(), anyInt())).thenReturn(Map.of("items", Collections.emptyList(), "total", 0L));
        when(productService.suggest(anyString())).thenReturn(Collections.emptyList());
        when(productService.searchProducts(anyString())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/products")).andExpect(status().isOk());
        mockMvc.perform(get("/products2")).andExpect(status().isOk());
        mockMvc.perform(get("/products2/suggest").param("q", "test")).andExpect(status().isOk());
        mockMvc.perform(get("/products/1")).andExpect(status().isOk());
        mockMvc.perform(get("/search").param("keyword", "test")).andExpect(status().isOk());
        mockMvc.perform(post("/products").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isCreated());
    }

    private Product createProduct(Long id, String name, BigDecimal cost, Integer stock) {
        Product product = new Product();
        product.setId(Math.toIntExact(id));
        product.setName(name);
        product.setCost(cost);
        product.setStock(stock);
        product.setWeight(new BigDecimal("1.5"));
        product.setImageUrl("http://example.com/image.jpg");
        return product;
    }
}