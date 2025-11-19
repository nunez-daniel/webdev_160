package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.OrderItem;
import com.ofs_160.webdev.Model.DeliveryCar;
import com.ofs_160.webdev.Service.OrderService;
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
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class) 
public class OrderControllerWebLayerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean 
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getMyOrders_WithOrders_ShouldReturnOrdersList() throws Exception {
        String username = "user@example.com";
        List<Order> orders = Arrays.asList(
            createOrder(1L, "PAID", new BigDecimal("99.99"), "cs_test_123"),
            createOrder(2L, "PENDING", new BigDecimal("49.99"), "cs_test_456")
        );

        when(orderService.getOrders(username)).thenReturn(orders);

        mockMvc.perform(get("/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].paymentStatus", is("PAID")))
                .andExpect(jsonPath("$[0].totalAmount", is(99.99)))
                .andExpect(jsonPath("$[0].stripeSessionId", is("cs_test_123")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].paymentStatus", is("PENDING")))
                .andExpect(jsonPath("$[1].totalAmount", is(49.99)));

        verify(orderService).getOrders(username);
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getMyOrders_WithEmptyOrders_ShouldReturnNoContent() throws Exception {
        String username = "user@example.com";
        when(orderService.getOrders(username)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(orderService).getOrders(username);
    }

    @Test
    void getMyOrders_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(orderService);
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getOrdersById_WithValidOrder_ShouldReturnFullOrderDetails() throws Exception {
        String username = "user@example.com";
        Long orderId = 1L;
        Order order = createOrder(orderId, "PAID", new BigDecimal("150.50"), "cs_test_789");
        order.setShippingName("John Doe");
        order.setShippingAddressLine1("123 Main St");
        order.setShippingCity("New York");
        order.setShippingState("NY");
        order.setShippingPostalCode("10001");
        order.setShippingCountry("US");

        when(orderService.getOrderByNameAndId(username, orderId)).thenReturn(order);

        mockMvc.perform(get("/orders/{orderId}", orderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(orderId.intValue())))
                .andExpect(jsonPath("$.paymentStatus", is("PAID")))
                .andExpect(jsonPath("$.totalAmount", is(150.50)))
                .andExpect(jsonPath("$.stripeSessionId", is("cs_test_789")))
                .andExpect(jsonPath("$.shippingName", is("John Doe")))
                .andExpect(jsonPath("$.shippingAddressLine1", is("123 Main St")))
                .andExpect(jsonPath("$.shippingCity", is("New York")))
                .andExpect(jsonPath("$.shippingState", is("NY")))
                .andExpect(jsonPath("$.shippingPostalCode", is("10001")))
                .andExpect(jsonPath("$.shippingCountry", is("US")));

        verify(orderService).getOrderByNameAndId(username, orderId);
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getOrdersById_WithNonExistentOrder_ShouldReturnNoContent() throws Exception {
        String username = "user@example.com";
        Long orderId = 999L;

        when(orderService.getOrderByNameAndId(username, orderId)).thenReturn(null);

        mockMvc.perform(get("/orders/{orderId}", orderId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(orderService).getOrderByNameAndId(username, orderId);
    }

    @Test
    void getOrdersById_WithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/orders/{orderId}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(orderService);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllOrders_WithAdminRole_ShouldReturnAllOrdersWithFullDetails() throws Exception {
        Order order1 = createOrder(1L, "PAID", new BigDecimal("99.99"), "cs_test_111");
        order1.setShippingName("Customer One");
        
        Order order2 = createOrder(2L, "REFUNDED", new BigDecimal("75.00"), "cs_test_222");
        order2.setShippingName("Customer Two");
        
        List<Order> orders = Arrays.asList(order1, order2);

        when(orderService.getAllOrders()).thenReturn(orders);

        mockMvc.perform(get("/orders-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].paymentStatus", is("PAID")))
                .andExpect(jsonPath("$[0].shippingName", is("Customer One")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].paymentStatus", is("REFUNDED")));

        verify(orderService).getAllOrders();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllOrders_WithEmptyOrders_ShouldReturnNoContent() throws Exception {
        when(orderService.getAllOrders()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/orders-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(orderService).getAllOrders();
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getAllOrders_WithCustomerRole_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/orders-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        verifyNoInteractions(orderService);
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllOrdersStatus_WithPaidOrders_ShouldReturnPaidOrdersOnly() throws Exception {
        Order paidOrder1 = createOrder(1L, "PAID", new BigDecimal("100.00"), "cs_test_paid1");
        Order paidOrder2 = createOrder(2L, "PAID", new BigDecimal("200.00"), "cs_test_paid2");
        List<Order> paidOrders = Arrays.asList(paidOrder1, paidOrder2);

        when(orderService.getAllOrdersStatus("PAID")).thenReturn(paidOrders);

        mockMvc.perform(get("/orders-all-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].paymentStatus", is("PAID")))
                .andExpect(jsonPath("$[1].paymentStatus", is("PAID")))
                .andExpect(jsonPath("$[0].totalAmount", is(100.00)))
                .andExpect(jsonPath("$[1].totalAmount", is(200.00)));

        verify(orderService).getAllOrdersStatus("PAID");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void getAllOrdersStatus_WithNoPaidOrders_ShouldReturnNoContent() throws Exception {
        when(orderService.getAllOrdersStatus("PAID")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/orders-all-status")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(orderService).getAllOrdersStatus("PAID");
    }

    @Test
    void getOrderStatus_WithValidSessionId_ShouldRedirectToOrderHistory() throws Exception {
        String sessionId = "cs_test_valid123";
        Order order = createOrder(1L, "PAID", new BigDecimal("99.99"), sessionId);

        when(orderService.findByStripeSessionId(sessionId)).thenReturn(order);

        mockMvc.perform(get("/order-status")
                .param("session_id", sessionId))
                .andExpect(status().isTemporaryRedirect())
                .andExpect(header().string("Location", "http://localhost:5173/order-history"));

        verify(orderService).findByStripeSessionId(sessionId);
    }

    @Test
    void getOrderStatus_WithOrderContainingDeliveryCar_ShouldStillRedirectCorrectly() throws Exception {
        String sessionId = "cs_test_with_car";
        Order order = createOrder(1L, "PAID", new BigDecimal("150.00"), sessionId);
        
        DeliveryCar deliveryCar = new DeliveryCar();
        deliveryCar.setId(1);
        order.setDeliveryCar(deliveryCar);

        when(orderService.findByStripeSessionId(sessionId)).thenReturn(order);

        mockMvc.perform(get("/order-status")
                .param("session_id", sessionId))
                .andExpect(status().isTemporaryRedirect())
                .andExpect(header().string("Location", "http://localhost:5173/order-history"));

        verify(orderService).findByStripeSessionId(sessionId);
    }

    @Test
    void getOrderStatus_WithInvalidSessionId_ShouldRedirectToStockInsufficient() throws Exception {
        String sessionId = "cs_test_invalid";

        when(orderService.findByStripeSessionId(sessionId)).thenReturn(null);

        mockMvc.perform(get("/order-status")
                .param("session_id", sessionId))
                .andExpect(status().isTemporaryRedirect())
                .andExpect(header().string("Location", "http://localhost:5173/stock-insufficient"));

        verify(orderService).findByStripeSessionId(sessionId);
    }

    @Test
    void getOrderStatus_WithOrderHavingItems_ShouldRedirectBasedOnOrderExistence() throws Exception {
        String sessionId = "cs_test_with_items";
        Order order = createOrder(1L, "PAID", new BigDecimal("75.50"), sessionId);
        
        OrderItem item1 = new OrderItem();
        item1.setId(1L);
        
        order.setItems(List.of(item1));

        when(orderService.findByStripeSessionId(sessionId)).thenReturn(order);

        mockMvc.perform(get("/order-status")
                .param("session_id", sessionId))
                .andExpect(status().isTemporaryRedirect())
                .andExpect(header().string("Location", "http://localhost:5173/order-history"));

        verify(orderService).findByStripeSessionId(sessionId);
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void getMyOrders_WithServiceException_ShouldHandleGracefully() throws Exception {
        String username = "user@example.com";
        when(orderService.getOrders(username)).thenThrow(new RuntimeException("Service error"));

        mockMvc.perform(get("/orders"))
                .andExpect(status().is5xxServerError());

        verify(orderService).getOrders(username);
    }

    private Order createOrder(Long id, String paymentStatus, BigDecimal totalAmount, String stripeSessionId) {
        Order order = new Order();
        order.setId(id);
        order.setPaymentStatus(paymentStatus);
        order.setTotalAmount(totalAmount);
        order.setStripeSessionId(stripeSessionId);
        order.setOrderDate(LocalDateTime.now());
        
        Customer customer = new Customer();
        customer.setCustomer_id(1);
        customer.setUsername("testuser@example.com");
        order.setCustomer(customer);
        
        return order;
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CUSTOMER"})
    void getOrders_WithPartialOrderData_ShouldHandleNullFields() throws Exception {
        String username = "user@example.com";
        Order order = new Order();
        order.setId(1L);
        order.setPaymentStatus("PENDING");
        
        when(orderService.getOrders(username)).thenReturn(List.of(order));

        mockMvc.perform(get("/orders")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].paymentStatus", is("PENDING")))
                .andExpect(jsonPath("$[0].totalAmount").doesNotExist())
                .andExpect(jsonPath("$[0].stripeSessionId").doesNotExist());

        verify(orderService).getOrders(username);
    }
}