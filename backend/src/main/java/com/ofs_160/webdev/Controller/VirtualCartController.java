package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Model.VirtualCartRequestBody;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Repository.ProductRepository;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.ProductService;
import com.ofs_160.webdev.ExceptionHandler.GlobalExceptionHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;
import com.ofs_160.webdev.DTO.ErrorResponse;


@RestController
public class VirtualCartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;
/*

    @PostMapping("/cart/add/{productId}")
    public ResponseEntity<VirtualCart> addToCart(
            @PathVariable int productId,
            @RequestParam int quantity, // from url -> add/1?quantity=3 maybe make adjustments cart only
            @AuthenticationPrincipal CustomerDetails principal)
    {
        // similar to /me for fetching username -> unique

        String username = principal.getUsername();
        //System.out.println("ss:" + principal.getUsername());
        VirtualCart updatedCart = cartService.addProductToCart(username, productId, quantity);

        // temporary for debugging
        return ResponseEntity.ok(updatedCart);
    }


*/

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCartMethod2(@RequestBody VirtualCartRequestBody request, @AuthenticationPrincipal CustomerDetails principal)
    {

        String username = principal.getUsername();
        
        // TODO... include a stock check here so users cant add overcount items amount
        if(productService.productCheckStock(username, request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart2 = cartService.addToCart(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart2));
        }
        // temporary for debugging

    }

    @GetMapping("/cart")
    public ResponseEntity<?> getVirtualCart(@AuthenticationPrincipal CustomerDetails principal)
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

    // Todo
    @PutMapping("/changeStock")
    public ResponseEntity<VirtualCartDTO> changeStockCount(
            @RequestBody VirtualCartRequestBody request,
            @AuthenticationPrincipal CustomerDetails principal)
    {


        String username = principal.getUsername();

        if(productService.productCheckStock(username, request.getProductId(), request.getQuantity()))
        {
            VirtualCart updatedCart = cartService.changeStockCount(username, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new VirtualCartDTO(updatedCart));
        }



    }




}