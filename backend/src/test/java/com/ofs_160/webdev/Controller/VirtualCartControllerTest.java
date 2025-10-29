package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Config.SecurityConfig;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Model.VirtualCartRequestBody;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.CustomerService; 
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal; 
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


// Load only the VirtualCartController and the necessary SecurityConfig
@WebMvcTest(VirtualCartController.class)
@Import(SecurityConfig.class)
class VirtualCartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    
    @MockBean
    private CartService cartService;

    
    @MockBean
    private UserDetailsService userDetailsService;
    @MockBean
    private CustomerService customerService; 

    private CustomerDetails authenticatedPrincipal;
    private final String TEST_USERNAME = "testuser@example.com";
    private VirtualCart mockVirtualCart;
    private final BigDecimal TEST_SUBTOTAL = new BigDecimal("55.50"); 

    @BeforeEach
    void setUp() {
        // 1. Setup Mock Customer and Principal
        Customer customer = new Customer();
        customer.setCustomer_id(101);
        customer.setUsername(TEST_USERNAME);
        customer.setRole("CUSTOMER");

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(customer.getRole()));

        // Create a mock OAuth2User object
        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                authorities,
                Map.of("email", customer.getUsername(), "sub", "test-sub-id"),
                "email"
        );
        
        // Create the principal that will be injected via @AuthenticationPrincipal
        authenticatedPrincipal = new CustomerDetails(customer, mockOAuth2User);

        // 2. Setup Mock VirtualCart
        mockVirtualCart = new VirtualCart();

        mockVirtualCart.setSubtotal(TEST_SUBTOTAL); 
        mockVirtualCart.setItemsInCart(Collections.emptyList()); 
    }

    // Helper method to create an AuthenticationPostProcessor
    private RequestPostProcessor principalAuth() {
        return authentication(new UsernamePasswordAuthenticationToken(
                authenticatedPrincipal, 
                null, 
                authenticatedPrincipal.getAuthorities()
        ));
    }

    @Test
    void addToCartMethod2_ShouldReturn200AndVirtualCartDTO() throws Exception {
        
        int productId = 5;
        int quantity = 3;
        VirtualCartRequestBody requestBody = new VirtualCartRequestBody(productId, quantity);

        when(cartService.addToCart(eq(TEST_USERNAME), eq(productId), eq(quantity)))
                .thenReturn(mockVirtualCart);

        
        mockMvc.perform(post("/cart/add")
                .with(principalAuth())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value("55.50"));

        verify(cartService).addToCart(TEST_USERNAME, productId, quantity);
    }

    @Test
    void getVirtualCart_ShouldReturn200AndVirtualCartDTO() throws Exception {

        when(cartService.getVirtualCart(eq(TEST_USERNAME)))
                .thenReturn(mockVirtualCart);


        mockMvc.perform(get("/cart")
                .with(principalAuth()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value("55.50")); 

        verify(cartService).getVirtualCart(TEST_USERNAME);
    }

    @Test
    void clearVirtualCart_ShouldReturn200AndVirtualCartDTO() throws Exception {
      
        when(cartService.clearVirtualCart(eq(TEST_USERNAME)))
                .thenReturn(mockVirtualCart); 

        
        mockMvc.perform(delete("/clear")
                .with(principalAuth())
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value("55.50"));

        verify(cartService).clearVirtualCart(TEST_USERNAME);
    }

    @Test
    void deleteItemVirtualCart_ShouldReturn200AndVirtualCartDTO() throws Exception {
     
        int productIdToDelete = 10;
        when(cartService.deleteItemVirtualCart(eq(TEST_USERNAME), eq(productIdToDelete)))
                .thenReturn(mockVirtualCart);

        
        mockMvc.perform(delete("/delete/{productId}", productIdToDelete)
                .with(principalAuth())
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value("55.50")); 

        verify(cartService).deleteItemVirtualCart(TEST_USERNAME, productIdToDelete);
    }

    @Test
    void changeStockCount_ShouldReturn200AndVirtualCartDTO() throws Exception {
     
        int productId = 7;
        int newQuantity = 5;
        VirtualCartRequestBody requestBody = new VirtualCartRequestBody(productId, newQuantity);

        when(cartService.changeStockCount(eq(TEST_USERNAME), eq(productId), eq(newQuantity)))
                .thenReturn(mockVirtualCart);

     
        mockMvc.perform(put("/changeStock")
                .with(principalAuth())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value("55.50")); 

        verify(cartService).changeStockCount(TEST_USERNAME, productId, newQuantity);
    }
}
