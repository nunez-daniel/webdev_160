package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.Repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void getOrders_WithValidCustomer_ShouldReturnOrders() {
        String principalName = "test@example.com";
        Customer mockCustomer = mock(Customer.class);
        Order mockOrder1 = mock(Order.class);
        Order mockOrder2 = mock(Order.class);
        List<Order> expectedOrders = Arrays.asList(mockOrder1, mockOrder2);

        when(customerRepository.findByEmail(principalName)).thenReturn(mockCustomer);
        when(orderRepository.findByCustomer(mockCustomer)).thenReturn(expectedOrders);

        List<Order> result = orderService.getOrders(principalName);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedOrders, result);
        verify(customerRepository).findByEmail(principalName);
        verify(orderRepository).findByCustomer(mockCustomer);
    }

    @Test
    void getOrders_WithCustomerHavingNoOrders_ShouldReturnEmptyList() {
        String principalName = "test@example.com";
        Customer mockCustomer = mock(Customer.class);

        when(customerRepository.findByEmail(principalName)).thenReturn(mockCustomer);
        when(orderRepository.findByCustomer(mockCustomer)).thenReturn(Collections.emptyList());

        List<Order> result = orderService.getOrders(principalName);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(customerRepository).findByEmail(principalName);
        verify(orderRepository).findByCustomer(mockCustomer);
    }

    @Test
    void getOrders_WithNonExistentCustomer_ShouldThrowNullPointerException() {
        String principalName = "nonexistent@example.com";
        
        when(customerRepository.findByEmail(principalName)).thenReturn(null);

        assertThrows(NullPointerException.class, () -> {
            orderService.getOrders(principalName);
        });

        verify(customerRepository).findByEmail(principalName);
    }

    @Test
    void getOrders_WithNullPrincipalName_ShouldThrowException() {
        String principalName = null;

        when(customerRepository.findByEmail(principalName)).thenReturn(null);

        assertThrows(Exception.class, () -> {
            orderService.getOrders(principalName);
        });

        verify(customerRepository).findByEmail(principalName);
    }

    @Test
    void getOrders_WithEmptyPrincipalName_ShouldThrowException() {
        String principalName = "";

        when(customerRepository.findByEmail(principalName)).thenReturn(null);

        assertThrows(Exception.class, () -> {
            orderService.getOrders(principalName);
        });

        verify(customerRepository).findByEmail(principalName);
    }

    @Test
    void getOrderByNameAndId_WithValidOrder_ShouldReturnOrder() {
        String principalName = "test@example.com";
        Long orderId = 1L;
        Order expectedOrder = mock(Order.class);

        when(orderRepository.findByIdAndCustomerUsername(orderId, principalName)).thenReturn(expectedOrder);

        Order result = orderService.getOrderByNameAndId(principalName, orderId);

        assertNotNull(result);
        assertEquals(expectedOrder, result);
        verify(orderRepository).findByIdAndCustomerUsername(orderId, principalName);
    }

    @Test
    void getOrderByNameAndId_WithNonExistentOrder_ShouldReturnNull() {
        String principalName = "test@example.com";
        Long orderId = 999L;

        when(orderRepository.findByIdAndCustomerUsername(orderId, principalName)).thenReturn(null);

        Order result = orderService.getOrderByNameAndId(principalName, orderId);

        assertNull(result);
        verify(orderRepository).findByIdAndCustomerUsername(orderId, principalName);
    }

    @Test
    void getAllOrders_ShouldReturnAllOrders() {
        Order order1 = mock(Order.class);
        Order order2 = mock(Order.class);
        Order order3 = mock(Order.class);
        List<Order> expectedOrders = Arrays.asList(order1, order2, order3);

        when(orderRepository.findAll()).thenReturn(expectedOrders);

        List<Order> result = orderService.getAllOrders();

        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals(expectedOrders, result);
        verify(orderRepository).findAll();
    }

    @Test
    void getAllOrders_WithNoOrders_ShouldReturnEmptyList() {
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());

        List<Order> result = orderService.getAllOrders();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository).findAll();
    }

    @Test
    void getAllOrdersStatus_WithValidStatus_ShouldReturnFilteredOrders() {
        String status = "PAID";
        Order paidOrder1 = mock(Order.class);
        Order paidOrder2 = mock(Order.class);
        List<Order> expectedOrders = Arrays.asList(paidOrder1, paidOrder2);

        when(orderRepository.findByPaymentStatus(status)).thenReturn(expectedOrders);

        List<Order> result = orderService.getAllOrdersStatus(status);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedOrders, result);
        verify(orderRepository).findByPaymentStatus(status);
    }

    @Test
    void getAllOrdersStatus_WithNoMatchingOrders_ShouldReturnEmptyList() {
        String status = "CANCELLED";
        when(orderRepository.findByPaymentStatus(status)).thenReturn(Collections.emptyList());

        List<Order> result = orderService.getAllOrdersStatus(status);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository).findByPaymentStatus(status);
    }

    @Test
    void getAllOrdersStatus_WithNullStatus_ShouldHandleGracefully() {
        String status = null;
        when(orderRepository.findByPaymentStatus(status)).thenReturn(Collections.emptyList());

        List<Order> result = orderService.getAllOrdersStatus(status);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository).findByPaymentStatus(status);
    }

    @Test
    void findByStripeSessionId_WithValidSessionId_ShouldReturnOrder() {
        String sessionId = "cs_test_123456789";
        Order expectedOrder = mock(Order.class);

        when(orderRepository.findByStripeSessionId(sessionId)).thenReturn(expectedOrder);

        Order result = orderService.findByStripeSessionId(sessionId);

        assertNotNull(result);
        assertEquals(expectedOrder, result);
        verify(orderRepository).findByStripeSessionId(sessionId);
    }

    @Test
    void findByStripeSessionId_WithNonExistentSessionId_ShouldReturnNull() {
        String sessionId = "cs_test_nonexistent";

        when(orderRepository.findByStripeSessionId(sessionId)).thenReturn(null);

        Order result = orderService.findByStripeSessionId(sessionId);

        assertNull(result);
        verify(orderRepository).findByStripeSessionId(sessionId);
    }

    @Test
    void findByStripeSessionId_WithNullSessionId_ShouldReturnNull() {
        String sessionId = null;

        when(orderRepository.findByStripeSessionId(sessionId)).thenReturn(null);

        Order result = orderService.findByStripeSessionId(sessionId);

        assertNull(result);
        verify(orderRepository).findByStripeSessionId(sessionId);
    }

    @Test
    void getOrders_VerifyRepositoryCallsAreMadeExactlyOnce() {
        String principalName = "test@example.com";
        Customer mockCustomer = mock(Customer.class);
        Order mockOrder = mock(Order.class);
        List<Order> expectedOrders = Arrays.asList(mockOrder);

        when(customerRepository.findByEmail(principalName)).thenReturn(mockCustomer);
        when(orderRepository.findByCustomer(mockCustomer)).thenReturn(expectedOrders);

        List<Order> result = orderService.getOrders(principalName);

        assertNotNull(result);
        assertEquals(1, result.size());
        
        verify(customerRepository, times(1)).findByEmail(principalName);
        verify(orderRepository, times(1)).findByCustomer(mockCustomer);
        verifyNoMoreInteractions(customerRepository, orderRepository);
    }

    @Test
    void getOrders_WithMultipleCalls_ShouldWorkCorrectly() {
        String principalName1 = "user1@example.com";
        String principalName2 = "user2@example.com";
        
        Customer mockCustomer1 = mock(Customer.class);
        Customer mockCustomer2 = mock(Customer.class);
        
        Order mockOrder1 = mock(Order.class);
        Order mockOrder2 = mock(Order.class);
        Order mockOrder3 = mock(Order.class);
        
        List<Order> orders1 = Arrays.asList(mockOrder1);
        List<Order> orders2 = Arrays.asList(mockOrder2, mockOrder3);

        when(customerRepository.findByEmail(principalName1)).thenReturn(mockCustomer1);
        when(customerRepository.findByEmail(principalName2)).thenReturn(mockCustomer2);
        when(orderRepository.findByCustomer(mockCustomer1)).thenReturn(orders1);
        when(orderRepository.findByCustomer(mockCustomer2)).thenReturn(orders2);

        List<Order> result1 = orderService.getOrders(principalName1);
        List<Order> result2 = orderService.getOrders(principalName2);

        assertNotNull(result1);
        assertEquals(1, result1.size());
        
        assertNotNull(result2);
        assertEquals(2, result2.size());
        
        verify(customerRepository).findByEmail(principalName1);
        verify(customerRepository).findByEmail(principalName2);
        verify(orderRepository).findByCustomer(mockCustomer1);
        verify(orderRepository).findByCustomer(mockCustomer2);
    }

    @Test
    void multipleMethodCalls_ShouldWorkIndependently() {
        String principalName = "test@example.com";
        Long orderId = 1L;
        String status = "PAID";
        String sessionId = "cs_test_123";
        
        Customer mockCustomer = mock(Customer.class);
        Order mockOrder1 = mock(Order.class);
        Order mockOrder2 = mock(Order.class);
        Order mockOrder3 = mock(Order.class);
        
        List<Order> customerOrders = Arrays.asList(mockOrder1);
        List<Order> allOrders = Arrays.asList(mockOrder1, mockOrder2, mockOrder3);
        List<Order> statusOrders = Arrays.asList(mockOrder1, mockOrder2);

        when(customerRepository.findByEmail(principalName)).thenReturn(mockCustomer);
        when(orderRepository.findByCustomer(mockCustomer)).thenReturn(customerOrders);
        when(orderRepository.findByIdAndCustomerUsername(orderId, principalName)).thenReturn(mockOrder1);
        when(orderRepository.findAll()).thenReturn(allOrders);
        when(orderRepository.findByPaymentStatus(status)).thenReturn(statusOrders);
        when(orderRepository.findByStripeSessionId(sessionId)).thenReturn(mockOrder3);

        List<Order> result1 = orderService.getOrders(principalName);
        Order result2 = orderService.getOrderByNameAndId(principalName, orderId);
        List<Order> result3 = orderService.getAllOrders();
        List<Order> result4 = orderService.getAllOrdersStatus(status);
        Order result5 = orderService.findByStripeSessionId(sessionId);

        assertEquals(1, result1.size());
        assertEquals(mockOrder1, result2);
        assertEquals(3, result3.size());
        assertEquals(2, result4.size());
        assertEquals(mockOrder3, result5);

        verify(customerRepository).findByEmail(principalName);
        verify(orderRepository).findByCustomer(mockCustomer);
        verify(orderRepository).findByIdAndCustomerUsername(orderId, principalName);
        verify(orderRepository).findAll();
        verify(orderRepository).findByPaymentStatus(status);
        verify(orderRepository).findByStripeSessionId(sessionId);
    }
}