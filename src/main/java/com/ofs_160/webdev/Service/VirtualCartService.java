package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.Repository.ProductRepository;
import com.ofs_160.webdev.Repository.VirtualCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class VirtualCartService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VirtualCartRepository virtualCartRepository;


    @Transactional
    public VirtualCart addToCart(String username, int productId, int quantity)
    {
        Customer customer = customerRepository.findByUsername(username);

        if(customer == null)
        {
            throw new NullPointerException("customer not found in cs");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("product not found: " + productId));

        VirtualCart virtualCart = customer.getVirtualCart();

        // if no cart exists
        if (virtualCart == null)
        {
            // System.out.println("cart created");
            virtualCart = new VirtualCart();
            customer.setVirtualCart(virtualCart);
            virtualCart.setCustomer(customer);

        }
        // System.out.println(customer.getCustomer_id()); verifying we can snag id
        Set<CartItem> itemsInCart = virtualCart.getItemsInCart();

        CartItem oldItem = null;
        for(CartItem cartItem: itemsInCart)
        {
            if(cartItem.getProduct() != null && cartItem.getProduct().getProduct_id() == productId)
            {
                oldItem = cartItem;
                break;
            }
        }

        // System.out.println(existingItem);

        if (oldItem != null)
        {
            oldItem.setQuantity(oldItem.getQuantity() + quantity);
        } else
        {
            // Create a new CartItem since non exist one
            CartItem newItem = new CartItem();
            newItem.setQuantity(quantity);
            newItem.setProduct(product);
            newItem.setVirtualCart(virtualCart);
            itemsInCart.add(newItem);
        }

        // Need a method to update weight and total before save
        // Should add fee as a column bool to the table as well
        // Need to perform stock then we can handle it properly when working with front-end findByProduct id get stock
        return virtualCartRepository.save(virtualCart);
    }


    public Set<CartItem> getCart(String username) {

        // Need to implement if user has no cart we create empty one here
        // as they can look at empty cart

        Customer customer = customerRepository.findByUsername(username);

        if(customer == null)
        {
            // customers logged in and shouldn't have access
            System.out.println("404 cs");
            throw new IllegalArgumentException("customer not found in cs");
        }

        VirtualCart virtualCart = customer.getVirtualCart();

        // if no cart exists
        if (virtualCart == null)
        {
            virtualCart = new VirtualCart();
            customer.setVirtualCart(virtualCart);
            virtualCart.setCustomer(customer);

        }

        return customer.getVirtualCart().getItemsInCart();

    }


}
