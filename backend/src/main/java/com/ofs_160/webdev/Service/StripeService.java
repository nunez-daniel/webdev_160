package com.ofs_160.webdev.Service;




import com.ofs_160.webdev.DTO.CartItemDTO;
import com.ofs_160.webdev.DTO.StripeResponse;
import com.ofs_160.webdev.DTO.VirtualCartDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
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
                .setSuccessUrl("http://localhost:5173/catalog")
                .setCancelUrl("http://localhost:5173/cart")

                .putMetadata("customer_id", customerId)
                .addAllLineItem(lineItems)
                .build();

        Session session = null;
        try {
            session = Session.create(params);
        } catch(StripeException e)
        {
            // temp
            System.out.println("Error in Stripe Service");
        }

        return  StripeResponse
                .builder()
                .status("SUCCESS")
                .message("Payment created")
                .sessionId(session.getId())
                .sessionUrl(session.getUrl())
                .build();
    }



}
