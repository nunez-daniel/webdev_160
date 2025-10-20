package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Model.VirtualCart;
import com.ofs_160.webdev.Service.CartService;
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

    @GetMapping({"/new-cart"})
    public ResponseEntity<StripeResponse> handleEvent(@AuthenticationPrincipal CustomerDetails principal) {
        String username = principal.getUsername();
        VirtualCart userCart = this.cartService.getVirtualCart(username);
        VirtualCartDTO userCartDTO = new VirtualCartDTO(userCart);
        StripeResponse stripeResponse = this.stripeService.checkoutProducts(userCartDTO);
        return new ResponseEntity<>(stripeResponse, HttpStatus.OK);
    }

    @PostMapping({"/webhook"})
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) throws StripeException {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, this.webhookKey);
        } catch (Exception var5) {
            return ResponseEntity.badRequest().body("Failed handle the request");
        }

        this.webhookService.checkoutVirtualCart(event);
        return ResponseEntity.ok().body("Success handling request");
    }

    @GetMapping({"/success"})
    public String handleSuccess() {
        return "Thank you for your order, you'll be redirected to order page in 3 seconds!";
    }
}
