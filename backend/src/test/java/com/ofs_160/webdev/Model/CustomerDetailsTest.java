package com.ofs_160.webdev.Model;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class CustomerDetailsTest {

    @Test
    void constructor_WithCustomerOnly_ShouldInitializeCorrectly() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "CUSTOMER", "John Doe");

        CustomerDetails customerDetails = new CustomerDetails(customer);

        assertNotNull(customerDetails);
        assertEquals(customer, customerDetails.getCustomer());
        assertNull(customerDetails.getAttributes());
    }

    @Test
    void constructor_WithCustomerAndOAuth2User_ShouldInitializeCorrectly() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "CUSTOMER", "John Doe");
        OAuth2User oauth2User = mock(OAuth2User.class);

        CustomerDetails customerDetails = new CustomerDetails(customer, oauth2User);

        assertNotNull(customerDetails);
        assertEquals(customer, customerDetails.getCustomer());
        assertNull(customerDetails.getAttributes());
    }

    @Test
    void getAuthorities_ShouldReturnCorrectAuthority() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "ADMIN", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        Collection<? extends GrantedAuthority> authorities = customerDetails.getAuthorities();

        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        
        GrantedAuthority authority = authorities.iterator().next();
        assertTrue(authority instanceof SimpleGrantedAuthority);
        assertEquals("ADMIN", authority.getAuthority());
    }

    @Test
    void getAuthorities_WithCustomerRole_ShouldReturnCustomerAuthority() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        Collection<? extends GrantedAuthority> authorities = customerDetails.getAuthorities();

        assertEquals(1, authorities.size());
        assertEquals("CUSTOMER", authorities.iterator().next().getAuthority());
    }

    @Test
    void getPassword_ShouldReturnCustomerPassword() {
        String expectedPassword = "encryptedPassword123";
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", expectedPassword, "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        String password = customerDetails.getPassword();

        assertEquals(expectedPassword, password);
    }

    @Test
    void getPassword_WithNullPassword_ShouldReturnNull() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", null, "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        String password = customerDetails.getPassword();

        assertNull(password);
    }

    @Test
    void getUsername_ShouldReturnCustomerUsername() {
        String expectedUsername = "testuser";
        Customer customer = createTestCustomer(1L, expectedUsername, "test@example.com", "password123", "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        String username = customerDetails.getUsername();

        assertEquals(expectedUsername, username);
    }

    @Test
    void getName_ShouldReturnCustomerUsername() {
        String expectedUsername = "testuser";
        Customer customer = createTestCustomer(1L, expectedUsername, "test@example.com", "password123", "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        String name = customerDetails.getName();

        assertEquals(expectedUsername, name);
    }

    @Test
    void getAttributes_ShouldReturnNull() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        Map<String, Object> attributes = customerDetails.getAttributes();

        assertNull(attributes);
    }

    @Test
    void accountStatusMethods_ShouldAlwaysReturnTrue() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "CUSTOMER", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        assertTrue(customerDetails.isAccountNonExpired());
        assertTrue(customerDetails.isAccountNonLocked());
        assertTrue(customerDetails.isCredentialsNonExpired());
        assertTrue(customerDetails.isEnabled());
    }

    @Test
    void getAuthorities_WithNullRole_ShouldHandleGracefully() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", null, "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        assertThrows(NullPointerException.class, () -> {
            customerDetails.getAuthorities();
        });
    }

    @Test
    void getAuthorities_WithEmptyRole_ShouldCreateEmptyAuthority() {
        Customer customer = createTestCustomer(1L, "testuser", "test@example.com", "password123", "", "John Doe");
        CustomerDetails customerDetails = new CustomerDetails(customer);

        Collection<? extends GrantedAuthority> authorities = customerDetails.getAuthorities();

        assertNotNull(authorities);
        assertEquals(1, authorities.size());
        assertEquals("", authorities.iterator().next().getAuthority());
    }

    @Test
    void multipleInstances_ShouldBeIndependent() {
        Customer customer1 = createTestCustomer(1L, "user1", "user1@example.com", "pass1", "CUSTOMER", "User One");
        Customer customer2 = createTestCustomer(2L, "user2", "user2@example.com", "pass2", "ADMIN", "User Two");
        
        CustomerDetails details1 = new CustomerDetails(customer1);
        CustomerDetails details2 = new CustomerDetails(customer2);

        assertEquals("user1", details1.getUsername());
        assertEquals("user2", details2.getUsername());
        assertEquals("pass1", details1.getPassword());
        assertEquals("pass2", details2.getPassword());
        assertEquals("CUSTOMER", details1.getAuthorities().iterator().next().getAuthority());
        assertEquals("ADMIN", details2.getAuthorities().iterator().next().getAuthority());
    }

    private Customer createTestCustomer(Long id, String username, String email, String password, String role, String fullName) {
        Customer customer = new Customer();
        customer.setCustomer_id(Math.toIntExact(id));
        customer.setUsername(username);
        customer.setEmail(email);
        customer.setPassword(password);
        customer.setRole(role);
        customer.setFull_name(fullName);
        return customer;
    }
}