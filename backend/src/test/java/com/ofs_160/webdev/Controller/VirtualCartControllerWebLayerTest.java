package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.DTO.CartItemDTO;
import com.ofs_160.webdev.Model.*;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.ProductService;
import com.ofs_160.webdev.Config.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(VirtualCartController.class)
@Import(SecurityConfig.class)
public class VirtualCartControllerWebLayerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @MockBean
    private ProductService productService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private void setupCustomerDetails(String username, String role, int customerId) {
        Customer customer = new Customer();
        customer.setUsername(username);
        customer.setPassword("encodedPassword");
        customer.setRole(role);
        customer.setCustomer_id(customerId);
        
        CustomerDetails customerDetails = new CustomerDetails(customer);
        
        Authentication auth = new UsernamePasswordAuthenticationToken(
            customerDetails, 
            null, 
            customerDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void addToCartMethod2_WithValidRequestAndStock_ShouldReturnUpdatedCart() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCartRequestBody request = new VirtualCartRequestBody(1, 3);
        VirtualCart virtualCart = createVirtualCart(1, username, customerId);
        virtualCart.setItemsInCart(createCartItems(virtualCart));
        
        when(productService.productCheckStock(username, request.getProductId(), request.getQuantity())).thenReturn(true);
        when(cartService.addToCart(username, request.getProductId(), request.getQuantity())).thenReturn(virtualCart);

        mockMvc.perform(post("/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(149.85)))
                .andExpect(jsonPath("$.total", is(149.85)))
                .andExpect(jsonPath("$.weight", is(7.5)))
                .andExpect(jsonPath("$.under_twenty_lbs", is(true)))
                .andExpect(jsonPath("$.customerId", is(customerId)))
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].id", is("1")))
                .andExpect(jsonPath("$.items[0].name", is("Test Product 1")))
                .andExpect(jsonPath("$.items[0].price", is(49.95)))
                .andExpect(jsonPath("$.items[0].qty", is(2)))
                .andExpect(jsonPath("$.items[0].weight", is(5.0)))
                .andExpect(jsonPath("$.items[0].imageUrl", is("/images/product1.jpg")));

        verify(productService).productCheckStock(username, request.getProductId(), request.getQuantity());
        verify(cartService).addToCart(username, request.getProductId(), request.getQuantity());
    }

    @Test
    void addToCartMethod2_WithInsufficientStock_ShouldReturnBadRequest() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCartRequestBody request = new VirtualCartRequestBody(1, 100);
        
        when(productService.productCheckStock(username, request.getProductId(), request.getQuantity())).thenReturn(false);

        mockMvc.perform(post("/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(productService).productCheckStock(username, request.getProductId(), request.getQuantity());
        verify(cartService, never()).addToCart(anyString(), anyInt(), anyInt());
    }

    @Test
    void getVirtualCart_WithExistingCart_ShouldReturnCartWithItems() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCart virtualCart = createVirtualCart(1, username, customerId);
        virtualCart.setItemsInCart(createCartItems(virtualCart));
        
        when(cartService.getVirtualCart(username)).thenReturn(virtualCart);

        mockMvc.perform(get("/cart")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(149.85)))
                .andExpect(jsonPath("$.total", is(149.85)))
                .andExpect(jsonPath("$.weight", is(7.5)))
                .andExpect(jsonPath("$.under_twenty_lbs", is(true)))
                .andExpect(jsonPath("$.customerId", is(customerId)))
                .andExpect(jsonPath("$.items", hasSize(2)))
                .andExpect(jsonPath("$.items[0].id", is("1")))
                .andExpect(jsonPath("$.items[0].name", is("Test Product 1")))
                .andExpect(jsonPath("$.items[0].price", is(49.95)))
                .andExpect(jsonPath("$.items[0].qty", is(2)))
                .andExpect(jsonPath("$.items[0].weight", is(5.0)))
                .andExpect(jsonPath("$.items[0].imageUrl", is("/images/product1.jpg")))
                .andExpect(jsonPath("$.items[1].id", is("2")))
                .andExpect(jsonPath("$.items[1].name", is("Test Product 2")))
                .andExpect(jsonPath("$.items[1].price", is(49.95)))
                .andExpect(jsonPath("$.items[1].qty", is(1)))
                .andExpect(jsonPath("$.items[1].weight", is(2.5)))
                .andExpect(jsonPath("$.items[1].imageUrl", is("/images/product2.jpg")));

        verify(cartService).getVirtualCart(username);
    }

    @Test
    void getVirtualCart_WithEmptyCart_ShouldReturnEmptyCartDTO() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCart emptyCart = createVirtualCart(1, username, customerId);
        emptyCart.setItemsInCart(new ArrayList<>());
        emptyCart.setSubtotal(BigDecimal.ZERO);
        emptyCart.setWeight(BigDecimal.ZERO);
        
        when(cartService.getVirtualCart(username)).thenReturn(emptyCart);

        mockMvc.perform(get("/cart")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(0)))
                .andExpect(jsonPath("$.total", is(0)))
                .andExpect(jsonPath("$.weight", is(0)))
                .andExpect(jsonPath("$.under_twenty_lbs", is(true)))
                .andExpect(jsonPath("$.customerId", is(customerId)))
                .andExpect(jsonPath("$.items", empty()));

        verify(cartService).getVirtualCart(username);
    }

    @Test
    void getVirtualCart_WithNullCustomer_ShouldHandleGracefully() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCart cartWithoutCustomer = createVirtualCart(1, username, customerId);
        cartWithoutCustomer.setCustomer(null);
        cartWithoutCustomer.setItemsInCart(createCartItems(cartWithoutCustomer));
        
        when(cartService.getVirtualCart(username)).thenReturn(cartWithoutCustomer);

        mockMvc.perform(get("/cart")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(149.85)))
                .andExpect(jsonPath("$.customerId").doesNotExist())
                .andExpect(jsonPath("$.items", hasSize(2)));

        verify(cartService).getVirtualCart(username);
    }

    @Test
    void getVirtualCart_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/cart")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(cartService);
    }

    @Test
    void clearVirtualCart_WithItems_ShouldReturnEmptyCart() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCart clearedCart = createVirtualCart(1, username, customerId);
        clearedCart.setItemsInCart(new ArrayList<>());
        clearedCart.setSubtotal(BigDecimal.ZERO);
        clearedCart.setWeight(BigDecimal.ZERO);
        
        when(cartService.clearVirtualCart(username)).thenReturn(clearedCart);

        mockMvc.perform(delete("/clear")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(0)))
                .andExpect(jsonPath("$.total", is(0)))
                .andExpect(jsonPath("$.weight", is(0)))
                .andExpect(jsonPath("$.customerId", is(customerId)))
                .andExpect(jsonPath("$.items", empty()));

        verify(cartService).clearVirtualCart(username);
    }

    @Test
    void deleteItemVirtualCart_WithValidProductId_ShouldReturnUpdatedCart() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        int productId = 1;
        VirtualCart updatedCart = createVirtualCart(1, username, customerId);
        List<CartItem> remainingItems = new ArrayList<>();
        remainingItems.add(createCartItem(2, 1, new BigDecimal("2.5"), updatedCart));
        updatedCart.setItemsInCart(remainingItems);
        updatedCart.setSubtotal(new BigDecimal("49.95"));
        updatedCart.setWeight(new BigDecimal("2.5"));
        
        when(cartService.deleteItemVirtualCart(username, productId)).thenReturn(updatedCart);

        mockMvc.perform(delete("/delete/{productId}", productId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(49.95)))
                .andExpect(jsonPath("$.total", is(49.95)))
                .andExpect(jsonPath("$.weight", is(2.5)))
                .andExpect(jsonPath("$.customerId", is(customerId)))
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].id", is("2")))
                .andExpect(jsonPath("$.items[0].name", is("Test Product 2")));

        verify(cartService).deleteItemVirtualCart(username, productId);
    }

    @Test
    void changeStockCount_WithValidQuantityChange_ShouldReturnUpdatedCart() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCartRequestBody request = new VirtualCartRequestBody(1, 5);
        VirtualCart updatedCart = createVirtualCart(1, username, customerId);
        List<CartItem> updatedItems = createCartItems(updatedCart);
        updatedItems.get(0).setQty(5);
        updatedItems.get(0).setWeight(new BigDecimal("12.5"));
        updatedCart.setItemsInCart(updatedItems);
        updatedCart.setSubtotal(new BigDecimal("249.75"));
        updatedCart.setWeight(new BigDecimal("12.5"));
        
        when(productService.productCheckStock(username, request.getProductId(), request.getQuantity())).thenReturn(true);
        when(cartService.changeStockCount(username, request.getProductId(), request.getQuantity())).thenReturn(updatedCart);

        mockMvc.perform(put("/changeStock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal", is(249.75)))
                .andExpect(jsonPath("$.total", is(249.75)))
                .andExpect(jsonPath("$.weight", is(12.5)))
                .andExpect(jsonPath("$.items[0].qty", is(5)))
                .andExpect(jsonPath("$.items[0].weight", is(12.5)));

        verify(productService).productCheckStock(username, request.getProductId(), request.getQuantity());
        verify(cartService).changeStockCount(username, request.getProductId(), request.getQuantity());
    }

    @Test
    void changeStockCount_WithInsufficientStock_ShouldReturnBadRequest() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCartRequestBody request = new VirtualCartRequestBody(1, 1000);
        
        when(productService.productCheckStock(username, request.getProductId(), request.getQuantity())).thenReturn(false);

        mockMvc.perform(put("/changeStock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(productService).productCheckStock(username, request.getProductId(), request.getQuantity());
        verify(cartService, never()).changeStockCount(anyString(), anyInt(), anyInt());
    }

    @Test
    void getVirtualCart_WhenServiceThrowsException_ShouldHandleGracefully() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        when(cartService.getVirtualCart(username)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/cart")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is5xxServerError());

        verify(cartService).getVirtualCart(username);
    }

    @Test
    void addToCart_WithInvalidJSON_ShouldReturnBadRequest() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        String invalidJson = "{ invalid json }";

        mockMvc.perform(post("/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(productService);
        verifyNoInteractions(cartService);
    }

    @Test
    void changeStockCount_WithZeroQuantity_ShouldRemoveItem() throws Exception {
        String username = "testuser@example.com";
        String role = "CUSTOMER";
        int customerId = 123;
        setupCustomerDetails(username, role, customerId);
        
        VirtualCartRequestBody request = new VirtualCartRequestBody(1, 0);
        VirtualCart updatedCart = createVirtualCart(1, username, customerId);
        List<CartItem> remainingItems = new ArrayList<>();
        remainingItems.add(createCartItem(2, 1, new BigDecimal("2.5"), updatedCart));
        updatedCart.setItemsInCart(remainingItems);
        updatedCart.setSubtotal(new BigDecimal("49.95"));
        updatedCart.setWeight(new BigDecimal("2.5"));
        
        when(productService.productCheckStock(username, request.getProductId(), request.getQuantity())).thenReturn(true);
        when(cartService.changeStockCount(username, request.getProductId(), request.getQuantity())).thenReturn(updatedCart);

        mockMvc.perform(put("/changeStock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].id", is("2")));

        verify(productService).productCheckStock(username, request.getProductId(), request.getQuantity());
        verify(cartService).changeStockCount(username, request.getProductId(), request.getQuantity());
    }

    private VirtualCart createVirtualCart(int id, String username, int customerId) {
        VirtualCart cart = new VirtualCart();
        cart.setVirtual_cart_id(id);
        cart.setSubtotal(new BigDecimal("149.85"));
        cart.setWeight(new BigDecimal("7.5"));
        cart.setUnder_twenty_lbs(true);
        
        Customer customer = new Customer();
        customer.setCustomer_id(customerId);
        customer.setUsername(username);
        cart.setCustomer(customer);
        
        return cart;
    }

    private List<CartItem> createCartItems(VirtualCart cart) {
        List<CartItem> items = new ArrayList<>();
        items.add(createCartItem(1, 2, new BigDecimal("5.0"), cart));
        items.add(createCartItem(2, 1, new BigDecimal("2.5"), cart));
        return items;
    }

    private CartItem createCartItem(int productId, int quantity, BigDecimal weight, VirtualCart cart) {
        CartItem item = new CartItem();
        item.setCart_item_id(productId);
        item.setQty(quantity);
        item.setWeight(weight);
        item.setVirtualCart(cart);
        
        Product product = new Product();
        product.setId(productId);
        product.setName("Test Product " + productId);
        product.setCost(new BigDecimal("49.95"));
        product.setWeight(new BigDecimal("2.5"));
        product.setImageUrl("/images/product" + productId + ".jpg");
        item.setProduct(product);
        
        return item;
    }
}