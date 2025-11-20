package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.*;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;


@RestController
public class VirtualCartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @Value("${custom.fee.id}")
    private int customFeeId;

    @PostMapping("/cart/add")
    public ResponseEntity<VirtualCartDTO> addToCartMethod2(@RequestBody VirtualCartRequestBody request, @AuthenticationPrincipal CustomerDetails principal)
    {

        String username = principal.getUsername();

        BigDecimal currentWeight = cartService.getVirtualCart(username).getWeight();

        Product product = productService.findProductById(request.getProductId());

        if (product != null)
        {
            BigDecimal itemWeight = product.getWeight();

            if (itemWeight == null)
            {
                itemWeight = BigDecimal.ZERO;
            }

            BigDecimal weightToAdd = itemWeight.multiply(BigDecimal.valueOf(request.getQuantity()));
            BigDecimal projectedTotal = currentWeight.add(weightToAdd);

            if (projectedTotal.compareTo(new BigDecimal(200)) > 0)
            {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }
        // TODO... include a stock check here so users cant add overcount items amount
        if(productService.productCheckStock(username, request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart2 = cartService.addToCart(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart2, customFeeId));
        }else
        {
            // Need to make this for not stock count there
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        // temporary for debugging

    }

    @GetMapping("/cart")
    public ResponseEntity<VirtualCartDTO> getVirtualCart(@AuthenticationPrincipal CustomerDetails principal)
    {
        String username = principal.getUsername();
        VirtualCart virtualCart = cartService.getVirtualCart(username);
        return ResponseEntity.ok(new VirtualCartDTO(virtualCart, customFeeId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<VirtualCartDTO> clearVirtualCart(@AuthenticationPrincipal CustomerDetails principal)
    {
        String username = principal.getUsername();

        VirtualCart clearedVC = cartService.clearVirtualCart(username);
        return ResponseEntity.ok(new VirtualCartDTO(clearedVC, customFeeId));
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<VirtualCartDTO> deleteItemVirtualCart(@PathVariable int productId, @AuthenticationPrincipal CustomerDetails principal)
    {
        String username = principal.getUsername();
        VirtualCart deleteFromVC = cartService.deleteItemVirtualCart(username, productId);
        return ResponseEntity.ok(new VirtualCartDTO(deleteFromVC, customFeeId));
    }

    // change cart item quantity to the desired total for that product
    @PutMapping("/changeStock")
    public ResponseEntity<?> changeStockCount(
            @RequestBody VirtualCartRequestBody request,
            @AuthenticationPrincipal CustomerDetails principal)
    {

        String username = principal.getUsername();

        VirtualCart cart = cartService.getVirtualCart(username);
        Product productToCheck = productService.findProductById(request.getProductId());

        if (cart != null && productToCheck != null)
        {
            BigDecimal projectedWeight = getBigDecimal(request, productToCheck, cart);
            if (projectedWeight.compareTo(new BigDecimal(200)) > 0)
            {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Total weight would exceed 200 lbs.");
            }
        }

        // changeStock receives the desired total quantity for the cart item, so
        // validate that the product has at least that many units in stock.
        if(productService.productCheckStockForTotal(request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart = cartService.changeStockCount(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart, customFeeId));
        }

        int available = 0;
        try {
            com.ofs_160.webdev.Model.Product p = productService.findProductById(request.getProductId());
            if (p != null) available = p.getStock();
        } catch (Exception ignored) {}

        String msg = String.format("Not enough stock: requested=%d, available=%d", request.getQuantity(), available);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);

    }

    private static BigDecimal getBigDecimal(VirtualCartRequestBody request, Product productToCheck, VirtualCart cart) {

        // Check other locations for new Big Decimal useage and replace
        BigDecimal projectedWeight = BigDecimal.ZERO;
        BigDecimal targetItemWeight = productToCheck.getWeight();

        for (CartItem item : cart.getItemsInCart())
        {
            BigDecimal itemWeight = item.getProduct().getWeight();

            if (item.getProduct().getId() == request.getProductId())
            {
                BigDecimal newQty = BigDecimal.valueOf(request.getQuantity());
                projectedWeight = projectedWeight.add(targetItemWeight.multiply(newQty));
            } else
            {
                BigDecimal currentQty = BigDecimal.valueOf(item.getQty());
                projectedWeight = projectedWeight.add(itemWeight.multiply(currentQty));
            }
        }
        return projectedWeight;
    }


}