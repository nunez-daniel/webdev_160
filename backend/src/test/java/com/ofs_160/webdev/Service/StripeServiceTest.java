package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.DTO.CartItemDTO;
import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StripeServiceTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private StripeService stripeService;

    private VirtualCartDTO validCartDTO;
    private final String MOCK_SECRET_KEY = "sk_test_mockkey";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(stripeService, "secretKey", MOCK_SECRET_KEY);
        validCartDTO = createTestVirtualCartDTO();
    }

    @Test
    void checkoutProducts_Success() throws StripeException {
        String expectedSessionId = "cs_test_mocksessionid";
        String expectedSessionUrl = "http://stripe.checkout.url";

        Session mockSession = mock(Session.class);
        when(mockSession.getId()).thenReturn(expectedSessionId);
        when(mockSession.getUrl()).thenReturn(expectedSessionUrl);

        try (MockedStatic<Session> sessionMockedStatic = mockStatic(Session.class)) {
            sessionMockedStatic.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenReturn(mockSession);

            StripeResponse response = stripeService.checkoutProducts(validCartDTO);

            assertNotNull(response);
            assertEquals("SUCCESS", response.getStatus());
            assertEquals("Payment created", response.getMessage());
            assertEquals(expectedSessionId, response.getSessionId());
            assertEquals(expectedSessionUrl, response.getSessionUrl());

            sessionMockedStatic.verify(() -> Session.create(any(SessionCreateParams.class)), times(1));
        }
    }

    @Test
    void checkoutProducts_StripeException_ShouldHandleGracefully() throws StripeException {
        try (MockedStatic<Session> sessionMockedStatic = mockStatic(Session.class)) {
            sessionMockedStatic.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenThrow(new StripeException("Mock Stripe Error", "mock_request", "mock_code", 500, null) {});

            assertThrows(NullPointerException.class, () -> {
            stripeService.checkoutProducts(validCartDTO);
            });

            StripeResponse response = stripeService.checkoutProducts(validCartDTO);
            assertNotNull(response);
            assertEquals("SUCCESS", response.getStatus());
            assertEquals("Payment created", response.getMessage());
            assertNull(response.getSessionId());
            assertNull(response.getSessionUrl());
            
        }
    }

    @Test
    void checkoutProducts_WithMultipleItems_ShouldCreateCorrectLineItems() throws StripeException {
        VirtualCartDTO multiItemCart = createVirtualCartWithMultipleItems();
        
        Session mockSession = mock(Session.class);
        when(mockSession.getId()).thenReturn("multi_session");
        when(mockSession.getUrl()).thenReturn("http://multi.session");

        try (MockedStatic<Session> sessionMockedStatic = mockStatic(Session.class)) {
            sessionMockedStatic.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenReturn(mockSession);

            StripeResponse response = stripeService.checkoutProducts(multiItemCart);

            assertNotNull(response);
            
            sessionMockedStatic.verify(() -> Session.create(any(SessionCreateParams.class)), times(1));
        }
    }

    @Test
    void checkoutProducts_WithZeroQuantity_ShouldHandleCorrectly() throws StripeException {
        VirtualCartDTO zeroQtyCart = createVirtualCartWithZeroQuantity();

        Session mockSession = mock(Session.class);
        when(mockSession.getId()).thenReturn("zero_session");
        when(mockSession.getUrl()).thenReturn("http://zero.session");

        try (MockedStatic<Session> sessionMockedStatic = mockStatic(Session.class)) {
            sessionMockedStatic.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenReturn(mockSession);

            StripeResponse response = stripeService.checkoutProducts(zeroQtyCart);

            assertNotNull(response);
            
            sessionMockedStatic.verify(() -> Session.create(any(SessionCreateParams.class)), times(1));
        }
    }

    @Test
    void checkoutProducts_VerifyLineItemDetails() throws StripeException {
        Session mockSession = mock(Session.class);
        when(mockSession.getId()).thenReturn("detail_session");
        when(mockSession.getUrl()).thenReturn("http://detail.session");

        try (MockedStatic<Session> sessionMockedStatic = mockStatic(Session.class)) {
            sessionMockedStatic.when(() -> Session.create(any(SessionCreateParams.class)))
                    .thenAnswer(invocation -> {
                        SessionCreateParams params = invocation.getArgument(0);
                        
                        assertEquals(SessionCreateParams.Mode.PAYMENT, params.getMode());
                        assertEquals("http://localhost:5173/catalog", params.getSuccessUrl());
                        assertEquals("http://localhost:5173/cart", params.getCancelUrl());
                        
                        return mockSession;
                    });

            StripeResponse response = stripeService.checkoutProducts(validCartDTO);

            assertNotNull(response);
            sessionMockedStatic.verify(() -> Session.create(any(SessionCreateParams.class)), times(1));
        }
    }

    private VirtualCartDTO createTestVirtualCartDTO() {
        VirtualCart virtualCart = createTestVirtualCart();
        return new VirtualCartDTO(virtualCart);
    }

    private VirtualCartDTO createVirtualCartWithMultipleItems() {
        VirtualCart virtualCart = createVirtualCartWithMultipleItemsEntity();
        return new VirtualCartDTO(virtualCart);
    }

    private VirtualCartDTO createVirtualCartWithZeroQuantity() {
        VirtualCart virtualCart = createVirtualCartWithZeroQuantityEntity();
        return new VirtualCartDTO(virtualCart);
    }

    private VirtualCart createTestVirtualCart() {
        VirtualCart virtualCart = new VirtualCart();
        virtualCart.setSubtotal(new BigDecimal("69.67"));
        virtualCart.setWeight(new BigDecimal("3.5"));
        virtualCart.setUnder_twenty_lbs(true);
        
        Customer customer = new Customer();
        customer.setCustomer_id(123);
        virtualCart.setCustomer(customer);
        
        List<CartItem> cartItems = new ArrayList<>();
        cartItems.add(createCartItem(1, 2, createProduct(101, "Test Product 1", "19.99", "image1.jpg")));
        cartItems.add(createCartItem(2, 1, createProduct(102, "Test Product 2", "29.99", "image2.jpg")));
        
        virtualCart.setItemsInCart(cartItems);
        
        for (CartItem item : cartItems) {
            item.setVirtualCart(virtualCart);
        }
        
        return virtualCart;
    }

    private VirtualCart createVirtualCartWithMultipleItemsEntity() {
        VirtualCart virtualCart = new VirtualCart();
        virtualCart.setSubtotal(new BigDecimal("101.00"));
        virtualCart.setWeight(new BigDecimal("8.2"));
        virtualCart.setUnder_twenty_lbs(true);
        
        Customer customer = new Customer();
        customer.setCustomer_id(456);
        virtualCart.setCustomer(customer);
        
        List<CartItem> cartItems = new ArrayList<>();
        cartItems.add(createCartItem(1, 1, createProduct(201, "Product A", "10.00", "imageA.jpg")));
        cartItems.add(createCartItem(2, 3, createProduct(202, "Product B", "20.00", "imageB.jpg")));
        cartItems.add(createCartItem(3, 2, createProduct(203, "Product C", "15.50", "imageC.jpg")));
        
        virtualCart.setItemsInCart(cartItems);
        
        for (CartItem item : cartItems) {
            item.setVirtualCart(virtualCart);
        }
        
        return virtualCart;
    }

    private VirtualCart createVirtualCartWithZeroQuantityEntity() {
        VirtualCart virtualCart = new VirtualCart();
        virtualCart.setSubtotal(new BigDecimal("0.00"));
        virtualCart.setWeight(new BigDecimal("0.5"));
        virtualCart.setUnder_twenty_lbs(true);
        
        Customer customer = new Customer();
        customer.setCustomer_id(789);
        virtualCart.setCustomer(customer);
        
        List<CartItem> cartItems = new ArrayList<>();
        cartItems.add(createCartItem(1, 0, createProduct(301, "Zero Qty Product", "15.00", "imageZero.jpg")));
        
        virtualCart.setItemsInCart(cartItems);
        
        for (CartItem item : cartItems) {
            item.setVirtualCart(virtualCart);
        }
        
        return virtualCart;
    }

    private CartItem createCartItem(int cartItemId, int quantity, Product product) {
        CartItem cartItem = new CartItem();
        cartItem.setCart_item_id(cartItemId);
        cartItem.setQty(quantity);
        cartItem.setProduct(product);
        return cartItem;
    }

    private Product createProduct(int id, String name, String price, String imageUrl) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setCost(new BigDecimal(price));
        product.setImageUrl(imageUrl);
        return product;
    }
}