package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.Repository.ProductRepository;
import com.ofs_160.webdev.Repository.VirtualCartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private VirtualCartRepository virtualCartRepository;

    @Value("${custom.fee.id}")
    private int customFeeId;

    @Transactional
    public VirtualCart addToCart(String username, int productId, int quantity) {
        Customer customer = customerRepository.findByUsername(username);

        if (customer == null)
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
        List<CartItem> itemsInCart = virtualCart.getItemsInCart();

        CartItem oldItem = null;
        for (CartItem cartItem : itemsInCart)
        {
            if (cartItem.getProduct() != null && cartItem.getProduct().getId() == productId)
            {
                oldItem = cartItem;
                break;
            }
        }

        // System.out.println(existingItem);

        if (oldItem != null)
        {
            oldItem.setQty(oldItem.getQty() + quantity);
        } else
        {
            // Create a new CartItem since non exist one
            CartItem newItem = new CartItem();
            newItem.setQty(quantity);
            newItem.setProduct(product);
            newItem.setWeight(product.getWeight());
            newItem.setVirtualCart(virtualCart);
            itemsInCart.add(newItem);
        }

        // Need a method to update weight and total before save
        // Should add fee as a column bool to the table as well
        // Need to perform stock then we can handle it properly when working with front-end findByProduct id get stock
        setWeightAndCostAndFee(virtualCart);
        return virtualCartRepository.save(virtualCart);
    }


    public void setWeightAndCostAndFee(VirtualCart virtualCart) {

        BigDecimal weight = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal fee_weight = new BigDecimal(20);

        CartItem feeItem = null;
        for (CartItem cartItem : virtualCart.getItemsInCart())
        {
            Product product = cartItem.getProduct();

            if (product != null) {
                if (product.getId() == customFeeId) {
                    feeItem = cartItem;
                    continue;
                }

                BigDecimal quantity = new BigDecimal(cartItem.getQty());

                BigDecimal itemTotal = product.getCost().multiply(quantity);
                total = total.add(itemTotal);

                BigDecimal itemWeight = product.getWeight().multiply(quantity);
                weight = weight.add(itemWeight);
            }
        }



        virtualCart.setWeight(weight);

        virtualCart.setUnder_twenty_lbs(weight.compareTo(fee_weight) >= 0);

        // add the temp item to the cart since weight is greater 20
        if(virtualCart.isUnder_twenty_lbs())
        {
            if (feeItem == null) {
                Product feeProduct = getWeightFeeProduct(customFeeId);

                CartItem newFeeItem = new CartItem();
                newFeeItem.setQty(1);
                newFeeItem.setProduct(feeProduct);
                newFeeItem.setWeight(BigDecimal.ZERO);
                newFeeItem.setVirtualCart(virtualCart);

                virtualCart.getItemsInCart().add(newFeeItem);

                total = total.add(feeProduct.getCost());

            }else
            {
                total = total.add(feeItem.getProduct().getCost());
            }
        }else
        {
            if (feeItem != null)
            {
                virtualCart.getItemsInCart().remove(feeItem);
                feeItem.setVirtualCart(null);
            }
        }

        virtualCart.setSubtotal(total);

    }

    private Product getWeightFeeProduct(int weightItemId) {
        return productRepository.findById(weightItemId).orElse(null);
    }


    public VirtualCart getVirtualCart(String username) {
        Customer customer = customerRepository.findByUsername(username);

        if(customer == null)
        {
            // customers logged in and shouldn't have access
            System.out.println("404 cs");
            throw new IllegalArgumentException("customer not found in cs");
        }

        VirtualCart virtualCart = customer.getVirtualCart();

        // if no cart exist create a new one and save it.
        if (virtualCart == null)
        {
            virtualCart = new VirtualCart();
            customer.setVirtualCart(virtualCart);
            virtualCart.setCustomer(customer);
            virtualCartRepository.save(virtualCart);
        }

        return customer.getVirtualCart();
    }

    @Transactional
    public VirtualCart changeStockCount(String username, int productId, int quantity) {
        if (quantity <= 0)
        {
            // quantity is 0 or less we just remove it
            return deleteItemVirtualCart(username, productId);
        }

        Customer customer = customerRepository.findByUsername(username);

        VirtualCart cart = getVirtualCart(customer.getUsername());
        List<CartItem> itemsInCart = cart.getItemsInCart();

        CartItem foundItem = null;
        for (CartItem item : itemsInCart)
        {
            if (item.getProduct() != null && item.getProduct().getId() == productId)
            {
                foundItem = item;
                break;
            }
        }

        if (foundItem != null)
        {
            foundItem.setQty(quantity);
            setWeightAndCostAndFee(cart);
            return virtualCartRepository.save(cart);

        } else
        {
            throw new RuntimeException("cant set quantity: productID " + productId + " not found in cart.");
        }
    }

    // check other table being updated correctly choose what to do when vcID becomes the null val...
    @Transactional
    public VirtualCart clearVirtualCart(String username) {
        Customer customer = customerRepository.findByUsername(username);
        if (customer == null) {
            // NTS: allow users to view products once they click on individual product ask them to nicely login
            throw new RuntimeException("Customer not found for username: " + username);
        }
        VirtualCart virtualCart = customer.getVirtualCart();
        if (virtualCart == null) {
            virtualCart = new VirtualCart();
            customer.setVirtualCart(virtualCart);
            virtualCart.setCustomer(customer);
        }

        virtualCart.getItemsInCart().clear();

        virtualCart.setSubtotal(BigDecimal.ZERO);
        virtualCart.setWeight(BigDecimal.ZERO);

        return virtualCartRepository.save(virtualCart);
    }

    @Transactional
    public VirtualCart deleteItemVirtualCart(String username, int productId) {
        Customer customer = customerRepository.findByUsername(username);
        if (customer == null) {
            // NTS: allow users to view products once they click on individual product ask them to nicely login
            throw new RuntimeException("Customer not found for username: " + username);
        }
        VirtualCart virtualCart = customer.getVirtualCart();
        if (virtualCart == null) {
            virtualCart = new VirtualCart();
            customer.setVirtualCart(virtualCart);
            virtualCart.setCustomer(customer);
            return virtualCartRepository.save(virtualCart); // new cart should be empty
        }

        List<CartItem> itemsInCart = virtualCart.getItemsInCart();

        CartItem itemDelete = null;
        for (CartItem item : itemsInCart)
        {
            if (item.getProduct() != null && item.getProduct().getId() == productId)
            {
                itemDelete = item;
                break;
            }
        }

        if (itemDelete != null)
        {
            itemsInCart.remove(itemDelete);
            itemDelete.setVirtualCart(null);
            setWeightAndCostAndFee(virtualCart);
            return virtualCartRepository.save(virtualCart);

        } else
        {
            return virtualCart;
        }
    }

    public int getQuantityInCart(int productId, String username) {
        Customer customer = customerRepository.findByUsername(username);
        if (customer == null) {
            // NTS: allow users to view products once they click on individual product ask them to nicely login
            throw new RuntimeException("Customer not found for username: " + username);
        }

        VirtualCart virtualCart = customer.getVirtualCart();

        if (virtualCart == null) {
            return 0; // new cart should be empty
        }

        int count = 0;
        for (CartItem item : virtualCart.getItemsInCart())
        {
            if (item.getProduct().getId()  == productId)
            {
                count = count + item.getQty();
            }
        }
        return count;
    }
}