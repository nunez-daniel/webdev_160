package com.ofs_160.webdev.Service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.ofs_160.webdev.ExceptionHandler.DuplicateCustomerException;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Repository.CustomerRepository;

class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        testCustomer = new Customer();
        testCustomer.setCustomer_id(1);
        testCustomer.setEmail("test@example.com");
        testCustomer.setUsername("testuser");
        testCustomer.setFull_name("Test User");
        testCustomer.setPassword("plaintext");
    }

    @Test
    void getAllCustomers_returnsList() {
        when(customerRepository.findAll()).thenReturn(List.of(testCustomer));

        List<Customer> customers = customerService.getAllCustomers();

        assertEquals(1, customers.size());
        verify(customerRepository).findAll();
    }

    @Test
    void findCustomerById_existingCustomer_returnsCustomer() {
        when(customerRepository.findById(1)).thenReturn(Optional.of(testCustomer));

        Customer result = customerService.findCustomerById(1);

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void findCustomerById_notFound_returnsNull() {
        when(customerRepository.findById(2)).thenReturn(Optional.empty());

        assertNull(customerService.findCustomerById(2));
    }

    @Test
    void registerCustomer_success_encodesPasswordAndSaves() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(null);

        customerService.registerCustomer(testCustomer);

        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());

        Customer saved = captor.getValue();
        assertEquals("CUSTOMER", saved.getRole());
        assertNotEquals("plaintext", saved.getPassword());
    }

    @Test
    void registerCustomer_duplicateEmail_throwsException() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(testCustomer);

        assertThrows(DuplicateCustomerException.class, () ->
                customerService.registerCustomer(testCustomer));
    }

    @Test
    void deleteCustomerById_deletesSuccessfully() {
        customerService.deleteCustomerById(1);
        verify(customerRepository).deleteById(1);
    }

    @Test
    void updateCustomer_callsSave() {
        customerService.updateCustomer(testCustomer);
        verify(customerRepository).save(testCustomer);
    }
}
