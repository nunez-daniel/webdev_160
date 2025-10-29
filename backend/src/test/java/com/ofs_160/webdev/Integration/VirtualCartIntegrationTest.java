package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCartRequestBody;
import com.ofs_160.webdev.Service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when; 


@SpringBootTest
@AutoConfigureMockMvc 
@Testcontainers
class VirtualCartIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;


    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.33")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void setDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.datasource.username", mysql::getUsername);
 
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }


    @MockBean
    private CustomerService customerService;

    private CustomerDetails authenticatedPrincipal;
    private Customer mockCustomer; 
    private final String TEST_USERNAME = "integration.user@example.com";

    @BeforeEach
    void setUp() {

        mockCustomer = new Customer();
        mockCustomer.setCustomer_id(201);
        mockCustomer.setUsername(TEST_USERNAME);
        mockCustomer.setRole("CUSTOMER");

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(mockCustomer.getRole()));


        OAuth2User mockOAuth2User = new DefaultOAuth2User(
                authorities,
                Map.of("email", mockCustomer.getUsername(), "sub", "test-int-sub-id"),
                "email"
        );


        authenticatedPrincipal = new CustomerDetails(mockCustomer, mockOAuth2User);


        when(customerService.findByUsername(TEST_USERNAME)).thenReturn(mockCustomer);
        when(customerService.findByEmail(TEST_USERNAME)).thenReturn(mockCustomer);
    }


    private RequestPostProcessor principalAuth() {
        return authentication(new UsernamePasswordAuthenticationToken(
                authenticatedPrincipal,
                null,
                authenticatedPrincipal.getAuthorities()
        ));
    }

    @Test
    void getVirtualCart_ShouldReturnInitialEmptyCart_IntegrationTest() throws Exception {
        // Arrange
        // The mockCustomer is now configured to be returned by customerService,
        // satisfying the CartService's dependency.

        // Act & Assert
        // We assert that the request is successful (200 OK) and the structure of
        // the returned DTO is correct (e.g., subtotal is 0).
        mockMvc.perform(get("/cart")
                .with(principalAuth()))
                .andExpect(status().isOk())
                // Asserting '0' as a string is safer than a double/BigDecimal comparison
                .andExpect(jsonPath("$.subtotal").value("0.00"))
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    // Additional integration tests (e.g., addToCart) would require mocking/setting up
    // the Product data that CartService depends on.
}