package com.ofs_160.webdev.DTO;

import com.ofs_160.webdev.Model.CartItem;
import com.ofs_160.webdev.Model.VirtualCart;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Data
public class VirtualCartDTO {

    private BigDecimal subtotal;
    private BigDecimal total;
    private BigDecimal weight;
    private boolean under_twenty_lbs;

    private Long customerId;

    private List<CartItemDTO> items;


    @Value("${custom.fee.id}")
    private int customFeeId;

    public VirtualCartDTO(VirtualCart cart)
    {
        if (cart.getCustomer() != null)
        {
            this.customerId = (long) cart.getCustomer().getCustomer_id();
        }

        this.subtotal = cart.getSubtotal();
        this.total = cart.getSubtotal();
        this.weight = cart.getWeight();
        this.under_twenty_lbs = cart.isUnder_twenty_lbs();

        List<CartItemDTO> dtoList = new ArrayList<>(cart.getItemsInCart().size());
        for (CartItem item : cart.getItemsInCart())
        {
            dtoList.add(new CartItemDTO(item));
        }

        String val = Integer.toString(customFeeId);
        dtoList.sort(Comparator.comparing(
                item -> val.equals(item.getId()) ? 1 : 0
        ));

        this.items = dtoList;
    }
}