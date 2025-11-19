package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.DTO.ProductDTO;
import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.OrderItem;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @InjectMocks
    private ProductService productService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartService cartService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = new Product(
                1, 
                "Apple", 
                new BigDecimal("5.00"), 
                10, 
                new BigDecimal("1.5"), 
                "http://example.com/apple.jpg"
        );
    }

    @Test
    void getAllProducts_ShouldReturnListOfProducts() {
        Product product2 = new Product(
                2,
                "Orange",
                new BigDecimal("3.00"),
                5,
                new BigDecimal("1.0"),
                "http://example.com/orange.jpg"
        );
        List<Product> expectedProducts = Arrays.asList(testProduct, product2);
        when(productRepository.findAll()).thenReturn(expectedProducts);

        List<Product> actualProducts = productService.getAllProducts();

        assertEquals(2, actualProducts.size());
        assertEquals("Apple", actualProducts.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    void findProductById_ExistingId_ShouldReturnProduct() {
        when(productRepository.findById(1)).thenReturn(Optional.of(testProduct));

        Product foundProduct = productService.findProductById(1);

        assertNotNull(foundProduct);
        assertEquals(1, foundProduct.getId());
        assertEquals("Apple", foundProduct.getName());
        verify(productRepository, times(1)).findById(1);
    }

    @Test
    void findProductById_NonExistingId_ShouldReturnNull() {
        when(productRepository.findById(99)).thenReturn(Optional.empty());

        Product foundProduct = productService.findProductById(99);

        assertNull(foundProduct);
        verify(productRepository, times(1)).findById(99);
    }

    @Test
    void deleteProductById_ShouldCallDeleteById() {
        productService.deleteProductById(1);

        verify(productRepository, times(1)).deleteById(1);
    }

    @Test
    void insertProduct_ShouldCallSave() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        productService.insertProduct(testProduct);

        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void updateProduct_ShouldCallSave() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        productService.updateProduct(testProduct);

        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    void searchProducts_WithKeyword_ShouldReturnMatchingProducts() {
        String keyword = "apple";
        List<Product> expectedProducts = List.of(testProduct);
        
        when(productRepository.findByNameContainingIgnoreCase(keyword)).thenReturn(expectedProducts);

        List<Product> result = productService.searchProducts(keyword);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Apple", result.get(0).getName());
        verify(productRepository).findByNameContainingIgnoreCase(keyword);
    }

    @Test
    void searchProducts_WithEmptyKeyword_ShouldReturnEmptyList() {
        String keyword = "";
        when(productRepository.findByNameContainingIgnoreCase(keyword)).thenReturn(List.of());

        List<Product> result = productService.searchProducts(keyword);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productRepository).findByNameContainingIgnoreCase(keyword);
    }

    @Test
    void checkStock_WithSufficientStock_ShouldReturnTrue() {
        VirtualCart cart = mock(VirtualCart.class);
        CartItem cartItem = mock(CartItem.class);
        Product product = mock(Product.class);
        
        when(cart.getItemsInCart()).thenReturn(List.of(cartItem));
        when(cartItem.getQty()).thenReturn(2);
        when(cartItem.getProduct()).thenReturn(product);
        when(product.getStock()).thenReturn(5);

        boolean result = productService.checkStock(cart);

        assertTrue(result);
    }

    @Test
    void checkStock_WithInsufficientStock_ShouldReturnFalse() {
        VirtualCart cart = mock(VirtualCart.class);
        CartItem cartItem = mock(CartItem.class);
        Product product = mock(Product.class);
        
        when(cart.getItemsInCart()).thenReturn(List.of(cartItem));
        when(cartItem.getQty()).thenReturn(10);
        when(cartItem.getProduct()).thenReturn(product);
        when(product.getStock()).thenReturn(5);

        boolean result = productService.checkStock(cart);

        assertFalse(result);
    }

    @Test
    void checkStock_WithEmptyCart_ShouldReturnTrue() {
        VirtualCart cart = mock(VirtualCart.class);
        when(cart.getItemsInCart()).thenReturn(Collections.emptyList());

        boolean result = productService.checkStock(cart);

        assertTrue(result);
    }

    @Test
    void productCheckStock_WithSufficientStock_ShouldReturnTrue() {
        String username = "testuser";
        int productId = 1;
        int quantity = 2;
        
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(cartService.getQuantityInCart(productId, username)).thenReturn(1);

        boolean result = productService.productCheckStock(username, productId, quantity);

        assertTrue(result);
        verify(productRepository).findById(productId);
        verify(cartService).getQuantityInCart(productId, username);
    }

    @Test
    void productCheckStock_WithInsufficientStock_ShouldReturnFalse() {
        String username = "testuser";
        int productId = 1;
        int quantity = 8;
        
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(cartService.getQuantityInCart(productId, username)).thenReturn(5);

        boolean result = productService.productCheckStock(username, productId, quantity);

        assertFalse(result);
    }

    @Test
    void productCheckStock_WithNonExistentProduct_ShouldReturnFalse() {
        String username = "testuser";
        int productId = 999;
        int quantity = 1;
        
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        boolean result = productService.productCheckStock(username, productId, quantity);

        assertFalse(result);
        verify(productRepository).findById(productId);
        verifyNoInteractions(cartService);
    }

    @Test
    void smartSearch_WithResults_ShouldReturnItemsAndTotal() {
        String query = "apple";
        int page = 1;
        int limit = 10;
        List<Product> products = List.of(testProduct);
        
        when(productRepository.smartSearch(query, limit, 0)).thenReturn(products);
        when(productRepository.smartSearchCount(query)).thenReturn(1L);

        Map<String, Object> result = productService.smartSearch(query, page, limit);

        assertNotNull(result);
        assertEquals(products, result.get("items"));
        assertEquals(1L, result.get("total"));
        assertNull(result.get("corrected"));
        verify(productRepository).smartSearch(query, limit, 0);
        verify(productRepository).smartSearchCount(query);
    }

    @Test
    void smartSearch_WithNoResults_ShouldTryCorrection() {
        String query = "appel";
        int page = 1;
        int limit = 10;
        String correctedQuery = "apple";
        List<Product> correctedProducts = List.of(testProduct);
        
        when(productRepository.smartSearch(query, limit, 0)).thenReturn(Collections.emptyList());
        when(productRepository.smartSearchCount(query)).thenReturn(0L);
        when(productRepository.smartSearch(correctedQuery, limit, 0)).thenReturn(correctedProducts);
        when(productRepository.smartSearchCount(correctedQuery)).thenReturn(1L);

        Map<String, Object> result = productService.smartSearch(query, page, limit);

        assertNotNull(result);
        assertEquals(correctedProducts, result.get("items"));
        assertEquals(1L, result.get("total"));
        assertEquals("apple", result.get("corrected"));
    }

    @Test
    void suggest_ShouldReturnFormattedSuggestions() {
        String query = "app";
        List<Object[]> rawResults = Arrays.asList(
            new Object[]{1, "Apple"},
            new Object[]{2, "Pineapple"}
        );
        
        when(productRepository.suggest(query)).thenReturn(rawResults);

        List<Map<String, Object>> result = productService.suggest(query);

        assertNotNull(result);
        assertEquals(2, result.size());
        
        Map<String, Object> firstSuggestion = result.get(0);
        assertEquals("1", firstSuggestion.get("id"));
        assertEquals("Apple", firstSuggestion.get("name"));
        
        Map<String, Object> secondSuggestion = result.get(1);
        assertEquals("2", secondSuggestion.get("id"));
        assertEquals("Pineapple", secondSuggestion.get("name"));
        
        verify(productRepository).suggest(query);
    }

    @Test
    void suggest_WithNoResults_ShouldReturnEmptyList() {
        String query = "xyz";
        when(productRepository.suggest(query)).thenReturn(Collections.emptyList());

        List<Map<String, Object>> result = productService.suggest(query);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(productRepository).suggest(query);
    }

    @Test
    void deductStock_WithSufficientStock_ShouldUpdateStock() {
        OrderItem orderItem = mock(OrderItem.class);
        Product product = new Product(1, "Test Product", new BigDecimal("10.00"), 10, new BigDecimal("1.0"), "image.jpg");
        
        when(orderItem.getProductName()).thenReturn("Test Product");
        when(orderItem.getQuantity()).thenReturn(3L);
        when(productRepository.findByNameWithLock("Test Product")).thenReturn(product);

        productService.deductStock(List.of(orderItem));

        assertEquals(7, product.getStock());
        verify(productRepository).findByNameWithLock("Test Product");
        verify(productRepository).save(product);
    }

    @Test
    void deductStock_WithInsufficientStock_ShouldThrowException() {
        OrderItem orderItem = mock(OrderItem.class);
        Product product = new Product(1, "Test Product", new BigDecimal("10.00"), 5, new BigDecimal("1.0"), "image.jpg");
        
        when(orderItem.getProductName()).thenReturn("Test Product");
        when(orderItem.getQuantity()).thenReturn(10L);
        when(productRepository.findByNameWithLock("Test Product")).thenReturn(product);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deductStock(List.of(orderItem));
        });
        
        assertEquals("INSUFFICIENT STOCK: Test Product", exception.getMessage());
        verify(productRepository).findByNameWithLock("Test Product");
        verify(productRepository, never()).save(any());
    }

    @Test
    void deductStock_WithNonExistentProduct_ShouldThrowException() {
        OrderItem orderItem = mock(OrderItem.class);
        
        when(orderItem.getProductName()).thenReturn("Non-existent Product");
        when(productRepository.findByNameWithLock("Non-existent Product")).thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.deductStock(List.of(orderItem));
        });
        
        assertEquals("Product is not found: Non-existent Product", exception.getMessage());
        verify(productRepository).findByNameWithLock("Non-existent Product");
        verify(productRepository, never()).save(any());
    }

    @Test
    void deductStock_WithMultipleItems_ShouldUpdateAll() {
        OrderItem item1 = mock(OrderItem.class);
        OrderItem item2 = mock(OrderItem.class);
        
        Product product1 = new Product(1, "Product 1", new BigDecimal("10.00"), 10, new BigDecimal("1.0"), "image1.jpg");
        Product product2 = new Product(2, "Product 2", new BigDecimal("20.00"), 8, new BigDecimal("2.0"), "image2.jpg");
        
        when(item1.getProductName()).thenReturn("Product 1");
        when(item1.getQuantity()).thenReturn(2L);
        when(item2.getProductName()).thenReturn("Product 2");
        when(item2.getQuantity()).thenReturn(3L);
        
        when(productRepository.findByNameWithLock("Product 1")).thenReturn(product1);
        when(productRepository.findByNameWithLock("Product 2")).thenReturn(product2);

        productService.deductStock(Arrays.asList(item1, item2));

        assertEquals(8, product1.getStock());
        assertEquals(5, product2.getStock());
        verify(productRepository, times(2)).save(any(Product.class));
    }

    @Test
    void productDTO_Constructor_ShouldMapProductCorrectly() {
        ProductDTO dto = new ProductDTO(testProduct);

        assertEquals("1", dto.getId(), "ID should be converted to String");
        assertEquals("Apple", dto.getName());
        assertEquals(new BigDecimal("5.00"), dto.getCost());
        assertEquals(new BigDecimal("1.5"), dto.getWeight());
        assertEquals(10, dto.getStock());
    }
}