package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Model.VirtualCartRequestBody;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
public class VirtualCartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @PostMapping("/cart/add")
    public ResponseEntity<VirtualCartDTO> addToCartMethod2(@RequestBody VirtualCartRequestBody request, @AuthenticationPrincipal CustomerDetails principal)
    {

        String username = principal.getUsername();

        // TODO... include a stock check here so users cant add overcount items amount
        if(productService.productCheckStock(username, request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart2 = cartService.addToCart(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart2));
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
        return ResponseEntity.ok(new VirtualCartDTO(virtualCart));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<VirtualCartDTO> clearVirtualCart(@AuthenticationPrincipal CustomerDetails principal)
    {
        String username = principal.getUsername();

        VirtualCart clearedVC = cartService.clearVirtualCart(username);
        return ResponseEntity.ok(new VirtualCartDTO(clearedVC));
    }

    @DeleteMapping("/delete/{productId}")
    public ResponseEntity<VirtualCartDTO> deleteItemVirtualCart(@PathVariable int productId, @AuthenticationPrincipal CustomerDetails principal)
    {
        String username = principal.getUsername();
        VirtualCart deleteFromVC = cartService.deleteItemVirtualCart(username, productId);
        return ResponseEntity.ok(new VirtualCartDTO(deleteFromVC));
    }

    // change cart item quantity to the desired total for that product
    @PutMapping("/changeStock")
    public ResponseEntity<?> changeStockCount(
            @RequestBody VirtualCartRequestBody request,
            @AuthenticationPrincipal CustomerDetails principal)
    {

        String username = principal.getUsername();

        // changeStock receives the desired total quantity for the cart item, so
        // validate that the product has at least that many units in stock.
        if(productService.productCheckStockForTotal(request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart = cartService.changeStockCount(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart));
        }

        int available = 0;
        try {
            com.ofs_160.webdev.Model.Product p = productService.findProductById(request.getProductId());
            if (p != null) available = p.getStock();
        } catch (Exception ignored) {}

        String msg = String.format("Not enough stock: requested=%d, available=%d", request.getQuantity(), available);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);

    }


}