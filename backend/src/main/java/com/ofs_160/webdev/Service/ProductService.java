package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.OrderItem;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Repository.CartItemRepository;
import com.ofs_160.webdev.Repository.VirtualCartRepository;
import jakarta.persistence.EntityNotFoundException;
import org.apache.commons.text.similarity.FuzzyScore;
import com.ofs_160.webdev.Repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductService {

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    VirtualCartRepository virtualCartRepository;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CartService cartService;

    @Value("${custom.fee.id}")
    private int customFeeId;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Need to make this not return null if not found
    public Product findProductById(int id) {
        return productRepository.findById(id).orElse(null);
    }

    @Transactional
    public void deleteProductById(int id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with ID: " + id));

        cartItemRepository.deleteByProductId(id);
        product.setActive(false);
        productRepository.save(product);
    }


    @Transactional
    public void restoreProductById(int id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("product not found " + id));

        if (!product.isActive())
        {
            product.setActive(true);
            productRepository.save(product);
        } else
        {
            throw new IllegalStateException("product is active already");
        }
    }


    public List<Product> getArchivedProducts() {
        int feeId = customFeeId;
        return productRepository.findByIdNotAndActiveFalse(feeId);
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
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(keyword);
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

    /**
     * Check whether the desired total quantity for a product is available in stock.
     * This differs from productCheckStock which treats the provided quantity as an
     * additional amount to the user's existing cart quantity.
     */
    public boolean productCheckStockForTotal(int productId, int desiredTotalQuantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;
        return product.getStock() >= desiredTotalQuantity;
    }

    public Map<String, Object> smartSearch(String q, int page, int limit) {
        int offset = (page - 1) * limit;

        List<Product> items = productRepository.smartSearch(q, limit, offset, customFeeId);
        long total = productRepository.smartSearchCount(q, customFeeId);

        // If we didn’t find much, try autocorrect
        String corrected = null;
        if (total == 0) {
            corrected = guessCorrection(q);
            if (corrected != null && !corrected.equalsIgnoreCase(q)) {
                items = productRepository.smartSearch(corrected, limit, offset, customFeeId);
                total = productRepository.smartSearchCount(corrected, customFeeId);
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("items", items);
        resp.put("total", total);
        resp.put("corrected", corrected); // null if not corrected
        return resp;
    }

    public List<Map<String, Object>> suggest(String q) {
        List<Object[]> rows = productRepository.suggest(q, customFeeId);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", String.valueOf(r[0]));
            m.put("name", String.valueOf(r[1]));
            out.add(m);
        }
        return out;
    }

    private String guessCorrection(String q) {
        // pull a small candidate pool to score against (cheap + good enough)
        List<Object[]> candidates = productRepository.suggest(q, customFeeId);
        if (candidates.isEmpty()) return null;

        FuzzyScore scorer = new FuzzyScore(Locale.ENGLISH);
        String best = null;
        int bestScore = -1;

        for (Object[] row : candidates) {
            String name = String.valueOf(row[1]);
            int score = scorer.fuzzyScore(name, q);
            if (score > bestScore) {
                bestScore = score;
                best = name;
            }
        }
        // basic guard: avoid “corrections” that are wildly off
        if (best != null && bestScore >= Math.max(2, q.length() / 2)) {
            return best;
        }
        return null;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deductStock(List<OrderItem> orderItems) {
        for (OrderItem item : orderItems)
        {

            Product product = productRepository.findByNameWithLock(item.getProductName());

            if (product == null)
            {
                // check is inside db
                throw new RuntimeException("Product is not found: " + item.getProductName());
            }

            int requestedQuantity = Math.toIntExact(item.getQuantity());
            int currentStock = product.getStock();

            if (currentStock < requestedQuantity)
            {
                throw new RuntimeException("INSUFFICIENT STOCK: " +  product.getName());
            }


            product.setStock(currentStock - requestedQuantity);
            productRepository.save(product);

        }
    }

    public List<Product> getAllProductsWithoutFeeItem(int FEE_PRODUCT_ID) {

        return productRepository.findByIdNotAndActiveTrue(FEE_PRODUCT_ID);

    }


    public List<Product> getActiveProducts(int customFeeId) {
        return productRepository.findByIdNotAndActiveTrue(customFeeId);
    }
}