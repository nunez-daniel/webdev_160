package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.VirtualCartRequestBody;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Service.VirtualCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
public class VirtualCartController {

    @Autowired
    private VirtualCartService cartService;

    @PostMapping("/cart/add")
    public ResponseEntity<VirtualCart> addToCart(@RequestBody VirtualCartRequestBody request, @AuthenticationPrincipal CustomerDetails principal)
    {
        // similar to /me for fetching username -> unique check info as needed
        String username = principal.getUsername();
        //System.out.println("ss:" + principal.getUsername());
        VirtualCart updatedCart = cartService.addToCart(username, request.getProductId(), request.getQuantity());

        // will be used temporary for debugging soley response when ready
        return ResponseEntity.ok(updatedCart);
    }

}