package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Service.CartService;
import com.ofs_160.webdev.Service.ProductService;
import com.ofs_160.webdev.Service.StripeService;
import com.ofs_160.webdev.Service.WebhookService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CheckOutController {
    @Autowired
    private StripeService stripeService;

    @Autowired
    private CartService cartService;

    @Autowired
    private WebhookService webhookService;

    @Value("${stripe.webhook}")
    private String webhookKey;
    @Autowired
    private ProductService productService;

    @GetMapping({"/new-cart"})
    public ResponseEntity<StripeResponse> handleEvent(@AuthenticationPrincipal CustomerDetails principal) {
        // Return 401 if user isnt logged in
        if (principal == null)
        {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String username = principal.getUsername();
        VirtualCart userCart = this.cartService.getVirtualCart(username);

        if (userCart == null)
        {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // stock check before checkout
        if (productService.checkStock(userCart)) {
            VirtualCartDTO userCartDTO = new VirtualCartDTO(userCart);
            try
            {
                StripeResponse stripeResponse = this.stripeService.checkoutProducts(userCartDTO);
                return new ResponseEntity<>(stripeResponse, HttpStatus.OK);
            } catch (Exception e) {
                System.err.println("Error creating stripe checkout session: " + e.getMessage());
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } else
        {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }




    }

    @PostMapping({"/webhook"})
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) throws StripeException {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, this.webhookKey);
        } catch (Exception var5) {
            return ResponseEntity.badRequest().body("Failed handle the request");
        }

        try
        {
            this.webhookService.checkoutVirtualCart(event);
        } catch (RuntimeException e)
        {
            // check for handling errors temporary
            if (e.getMessage().startsWith("INSUFFICIENT STOCK"))
            {
                System.err.println("STOCK ROLLBACK HANDLED: " + e.getMessage());
                return ResponseEntity.ok().body("Stock rollback successful. Order not created.");
            }

            throw e;
        }

        return ResponseEntity.ok().body("Success handling request");
    }

    @GetMapping({"/success"})
    public String handleSuccess() {
        return "Thank you for your order, you'll be redirected to order page in 3 seconds!";
    }
}
