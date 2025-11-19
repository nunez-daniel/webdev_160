package com.ofs_160.webdev.Service;




import com.ofs_160.webdev.DTO.CartItemDTO;
import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.exception.CardException;
import com.stripe.exception.RateLimitException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.ApiConnectionException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StripeService {


    private final ProductService productService;
    @Value("${stripe.secretKey}")
    private String secretKey;

    public StripeService(ProductService productService) {
        this.productService = productService;
    }


    public StripeResponse checkoutProducts(VirtualCartDTO virtualCartDTO)
    {
        Stripe.apiKey=secretKey;

        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for(CartItemDTO cartItemDTO: virtualCartDTO.getItems()) {
            long priceInCents = cartItemDTO.getPrice().multiply(new java.math.BigDecimal(100))
                    .longValueExact();

            SessionCreateParams.LineItem.PriceData.ProductData productData =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(cartItemDTO.getName())
                            .addAllImage(List.of(cartItemDTO.getImageUrl()))
                            .build();

            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("USD")
                            .setUnitAmount(priceInCents)
                            .setProductData(productData)
                            .build();

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity((long) cartItemDTO.getQty())
                    .setPriceData(priceData)
                    .build();

            lineItems.add(lineItem);
        }

        String customerId = virtualCartDTO.getCustomerId().toString();

        SessionCreateParams params  = SessionCreateParams.builder()
                .setShippingAddressCollection(SessionCreateParams.ShippingAddressCollection.builder()
                        .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                        .build())
                .setCustomText(
                     SessionCreateParams.CustomText.builder()
                        .setShippingAddress(
                                SessionCreateParams.CustomText.ShippingAddress.builder()
                        .setMessage(
                                "Address grocery items will be delivered to :)").build()
                )
                     .build()
                )

                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:8080/order-status?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/cart")

                .putMetadata("customer_id", customerId)
                .addAllLineItem(lineItems)
                .build();

        Session session = null;
        try {
            session = Session.create(params);
        } catch(CardException e)
        {
                return handleCardException(e);
        }
        catch(StripeException e)
        {
            // temp
            System.err.println("Error in Stripe Service: " + e.getMessage());
        
            return handleGenericStripeException(e);
        }

        return  StripeResponse
                .builder()
                .status("SUCCESS")
                .message("Payment created")
                .sessionId(session.getId())
                .sessionUrl(session.getUrl())
                .build();
    }

    private StripeResponse handleCardException(CardException e) {
        String userMessage;
        
        switch (e.getCode()) {
                case "card_declined":
                        userMessage = "Your card was declined by the bank. Please try a different payment method.";
                        break;
                case "expired_card":
                        userMessage = "Your card has expired. Please use a different card.";
                        break;
                case "insufficient_funds":
                        userMessage = "Insufficient funds. Please use a different payment method.";
                        break;
                case "invalid_number":
                        userMessage = "Invalid card number. Please check your card details.";
                        break;
                case "incorrect_cvc":
                        userMessage = "Incorrect CVC code. Please check your card security code.";
                        break;
                default:
                        userMessage = "Payment failed. Please try a different card.";
        }
        
        return StripeResponse
                .builder()
                .status("ERROR")
                .message(userMessage)
                .sessionId(null)
                .sessionUrl(null)
                .build();
    }

    private StripeResponse handleGenericStripeException(StripeException e) {
        String userMessage;
        
        if (e instanceof RateLimitException) {
                userMessage = "Too many payment attempts. Please wait a moment.";

 
        } else if (e instanceof InvalidRequestException) {
                userMessage = "Payment system configuration error. Please contact support.";


        } else if (e instanceof AuthenticationException) {
                userMessage = "Payment authentication failed. Please contact support.";
    
        } else if (e instanceof ApiConnectionException) {
                userMessage = "Network connection issue. Please check your internet connection and try again.";
        } else {
                userMessage = "Payment service temporarily unavailable. Please try again.";

        }
        
        return StripeResponse
                .builder()
                .status("ERROR")
                .message(userMessage)
                .sessionId(null)
                .sessionUrl(null)
                .build();
     }


}
