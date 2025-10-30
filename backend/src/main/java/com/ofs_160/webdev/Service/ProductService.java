package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CartService cartService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Need to make this not return null if not found
    public Product findProductById(int id) {
        return productRepository.findById(id).orElse(null);
    }

    public void deleteProductById(int id) {
        productRepository.deleteById(id);
    }

    public void insertProduct(Product product) {
        productRepository.save(product);
    }

    public void updateProduct(Product product) {
        productRepository.save(product);
    }

    /*public Product addProductImage(Product product, MultipartFile image) throws IOException {

        product.setImageName(image.getOriginalFilename());
        product.setImageType(image.getContentType());
        product.setImageData(image.getBytes());
        return productRepository.save(product);



    }*/

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    // checkout finally stock checker
    // TODO... NOT WORKING WIH PUT
    public boolean checkStock(VirtualCart userCart) {
        boolean allInStock = true;

        for (CartItem item : userCart.getItemsInCart())
        {
            int requestedQuantity = item.getQty();
            int currentStock = item.getProduct().getStock();

            if (requestedQuantity > currentStock)
            {
                allInStock = false;
                break;
            }
        }

        return allInStock;



    }


    public boolean productCheckStock(String username, int productId, int quantity) {

        // temp null
        Product product = productRepository.findById(productId).orElse(null);

        if(product == null)
        {
            System.out.println("productCheck Stock error");
            return false;
        }

        int quantityAlreadyInCart = cartService.getQuantityInCart(productId, username);
        int newTotalQuantity = quantityAlreadyInCart + quantity;

        if(product.getStock() < newTotalQuantity)
        {
            System.out.println("Not enough stock");
            return false;
        }



        return true;
    }

}
