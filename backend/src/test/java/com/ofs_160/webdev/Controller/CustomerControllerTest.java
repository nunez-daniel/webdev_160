package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Config.SecurityConfig;
import com.ofs_160.webdev.ExceptionHandler.DuplicateCustomerException;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Map; 

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(CustomerController.class)
@Import(SecurityConfig.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;


    @MockBean
    private CustomerService customerService;


    @MockBean
    private UserDetailsService userDetailsService;


    @Autowired
    private ObjectMapper objectMapper;

    private Customer customer1;
    private CustomerDetails customerDetails;

    @BeforeEach
    void setUp() {
        customer1 = new Customer();
        customer1.setCustomer_id(101);
        customer1.setFull_name("Jane Doe");
        customer1.setEmail("jane@example.com");
        customer1.setUsername("janedoe");
        customer1.setPassword("encoded_pass");
        customer1.setRole("CUSTOMER"); 


        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(customer1.getRole()));


        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                authorities,
                Map.of("email", customer1.getEmail(), "sub", "test-sub-id"),
                "email" 
        );

        customerDetails = new CustomerDetails(customer1, mockOAuth2User);
    }

    // N ACCESS ONLY ENDPOINTS 

    @Test
    @WithMockUser(authorities = "ADMIN")
    void getCustomer_WithAdminRole_ShouldReturn200Ok() throws Exception {

        List<Customer> customers = Collections.singletonList(customer1);
        when(customerService.getAllCustomers()).thenReturn(customers);

        mockMvc.perform(get("/customer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("janedoe"));

        verify(customerService).getAllCustomers();
    }

    @Test
    @WithMockUser(authorities = "CUSTOMER")
    void getCustomer_WithCustomerRole_ShouldReturn403Forbidden() throws Exception {

        mockMvc.perform(get("/customer"))
                .andExpect(status().isForbidden());

        verify(customerService, never()).getAllCustomers();
    }


    @Test
    void getCustomerById_SelfAccess_ShouldReturn200Ok() throws Exception {
        when(customerService.findCustomerById(101)).thenReturn(customer1);

        mockMvc.perform(get("/customer/101")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                        .authentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                customerDetails, null, customerDetails.getAuthorities()
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customer_id").value(101));

        verify(customerService).findCustomerById(101);
    }
    
    @Test
    void getCustomerById_NotFound_ShouldReturn404() throws Exception {
        final int TEST_ID = 999;
        

        Customer matchingCustomer = new Customer();
        matchingCustomer.setCustomer_id(TEST_ID); 
        matchingCustomer.setRole("CUSTOMER"); 
        

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(matchingCustomer.getRole()));
        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                authorities,
                Map.of("email", "mismatch@example.com", "sub", "test-sub-id-" + TEST_ID),
                "email"
        );
        CustomerDetails matchingPrincipal = new CustomerDetails(matchingCustomer, mockOAuth2User);



        when(customerService.findCustomerById(TEST_ID)).thenReturn(null);

        mockMvc.perform(get("/customer/" + TEST_ID) 
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
                        .authentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                matchingPrincipal, null, matchingPrincipal.getAuthorities()
                        ))))
                .andExpect(status().isNotFound()); 
        
        verify(customerService).findCustomerById(TEST_ID);
    }

    // TE CUSTOMER 

  @WithMockUser(authorities = "ADMIN")
    void deleteCustomerById_ExistingId_ShouldReturn200Ok() throws Exception {
     
        when(customerService.findCustomerById(101)).thenReturn(customer1);
        doNothing().when(customerService).deleteCustomerById(101);

    
        mockMvc.perform(delete("/customer/101").with(csrf())) 
                .andExpect(status().isOk())
                .andExpect(content().string("Customer Deleted"));

        verify(customerService).deleteCustomerById(101);
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteCustomerById_NonExistingId_ShouldReturn404NotFound() throws Exception {
    
        when(customerService.findCustomerById(999)).thenReturn(null);

        
        mockMvc.perform(delete("/customer/999").with(csrf()))
                .andExpect(status().isNotFound());

        verify(customerService, never()).deleteCustomerById(anyInt());
    }

   

    @Test
    void register_NewCustomer_ShouldReturn201Created() throws Exception {
       
        doNothing().when(customerService).registerCustomer(any(Customer.class));


        mockMvc.perform(post("/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer1))
                .with(csrf())) 
                .andExpect(status().isCreated());

        verify(customerService).registerCustomer(any(Customer.class));
    }

    @Test
    void register_DuplicateCustomer_ShouldReturn409Conflict() throws Exception {

        doThrow(new DuplicateCustomerException("Username exists")).when(customerService).registerCustomer(any(Customer.class));


        mockMvc.perform(post("/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer1))
                .with(csrf()))
                .andExpect(status().isConflict());

        verify(customerService).registerCustomer(any(Customer.class));
    }
}
