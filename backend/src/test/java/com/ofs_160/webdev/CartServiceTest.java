package com.ofs_160.webdev.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.Repository.ProductRepository;
import com.ofs_160.webdev.Repository.VirtualCartRepository;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private VirtualCartRepository virtualCartRepository;

    @InjectMocks
    private CartService cartService;

    private Customer customer;
    private VirtualCart virtualCart;
    private Product product;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        product = new Product();
        product.setId(1);
        product.setCost(new BigDecimal("10.00"));
        product.setWeight(new BigDecimal("2.0"));

        virtualCart = new VirtualCart();
        virtualCart.setItemsInCart(new ArrayList<>());

        customer = new Customer();
        customer.setUsername("john");
        customer.setVirtualCart(virtualCart);
        virtualCart.setCustomer(customer);
    }

    // addToCart
    @Test
    void addToCart_createsNewItemWhenNotInCart() {
        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(productRepository.findById(1)).thenReturn(Optional.of(product));
        when(virtualCartRepository.save(any(VirtualCart.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        VirtualCart result = cartService.addToCart("john", 1, 2);

        assertEquals(1, result.getItemsInCart().size());
        assertEquals(2, result.getItemsInCart().get(0).getQty());
        assertEquals(new BigDecimal("20.00"), result.getSubtotal());
        verify(virtualCartRepository).save(any(VirtualCart.class));
    }

    @Test
    void addToCart_incrementsQuantityIfItemExists() {
        CartItem existing = new CartItem();
        existing.setProduct(product);
        existing.setQty(1);
        virtualCart.getItemsInCart().add(existing);

        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(productRepository.findById(1)).thenReturn(Optional.of(product));
        when(virtualCartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.addToCart("john", 1, 3);

        assertEquals(1, result.getItemsInCart().size());
        assertEquals(4, result.getItemsInCart().get(0).getQty());
    }

    @Test
    void addToCart_throwsIfCustomerNotFound() {
        when(customerRepository.findByUsername("noone")).thenReturn(null);
        NullPointerException thrown = assertThrows(
          NullPointerException.class, 
          () -> cartService.addToCart("noone", 1, 1)
        ); 
        assertTrue(thrown.getMessage().contains("Customer not found"));
    }

    // getVirtualCart
    @Test
    void getVirtualCart_createsNewIfNoneExists() {
        customer.setVirtualCart(null);
        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(virtualCartRepository.save(any(VirtualCart.class))).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.getVirtualCart("john");
        assertNotNull(result);
        assertEquals(customer, result.getCustomer());
    }

    @Test
    void getVirtualCart_throwsIfCustomerNotFound() {
        when(customerRepository.findByUsername("bad")).thenReturn(null);
        IllegalArgumentException thrown = assertThrows(
            IllegalArgumentException.class, 
            () -> cartService.getVirtualCart("bad")
        );    
        assertTrue(thrown.getMessage().contains("Customer not found"));
      }

    //  changeStockCount
    @Test
    void changeStockCount_updatesQuantity() {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQty(1);
        virtualCart.getItemsInCart().add(item);

        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(virtualCartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.changeStockCount("john", 1, 5);
        assertEquals(5, result.getItemsInCart().get(0).getQty());
    }

    @Test
    void changeStockCount_removesItemWhenQuantityZero() {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQty(1);
        virtualCart.getItemsInCart().add(item);

        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(virtualCartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.changeStockCount("john", 1, 0);
        assertEquals(0, result.getItemsInCart().size());
    }

    
    // clearVirtualCart
    @Test
    void clearVirtualCart_resetsTotalsAndClearsItems() {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQty(2);
        virtualCart.getItemsInCart().add(item);

        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(virtualCartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.clearVirtualCart("john");

        assertEquals(0, result.getItemsInCart().size());
        assertEquals(BigDecimal.ZERO, result.getSubtotal());
    }

    // deleteItemVirtualCart
    @Test
    void deleteItemVirtualCart_removesItemIfExists() {
        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQty(1);
        virtualCart.getItemsInCart().add(item);

        when(customerRepository.findByUsername("john")).thenReturn(customer);
        when(virtualCartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        VirtualCart result = cartService.deleteItemVirtualCart("john", 1);
        assertTrue(result.getItemsInCart().isEmpty());
    }

    @Test
    void deleteItemVirtualCart_returnsSameCartIfItemNotFound() {
        when(customerRepository.findByUsername("john")).thenReturn(customer);
      

        VirtualCart result = cartService.deleteItemVirtualCart("john", 99);
        assertEquals(0, result.getItemsInCart().size());
        verify(virtualCartRepository, never()).save(any(VirtualCart.class));
    }
}
