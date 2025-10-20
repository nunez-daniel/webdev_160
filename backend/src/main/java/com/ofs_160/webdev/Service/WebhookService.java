package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Order;
import com.ofs_160.webdev.Model.OrderItem;
import com.ofs_160.webdev.Repository.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.LineItem;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionListLineItemsParams;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Service
public class WebhookService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CartService cartService;


    @Transactional
    public void checkoutVirtualCart(Event event) throws StripeException {
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session == null) return;

            String sessionId = session.getMetadata().get("customer_id");

            int customerId = Integer.parseInt(sessionId);

            Customer customer = customerService.findCustomerById(customerId);

            // make order for table
            Order newOrder = newOrder(customer);

            List<OrderItem> orderItems = getOrderItems(session, newOrder);
            newOrder.setItems(orderItems);
            orderRepository.save(newOrder);
            cartService.clearVirtualCart(customer.getUsername());

        }
    }

    private List<OrderItem> getOrderItems(Session session, Order newOrder) throws StripeException {
        SessionListLineItemsParams params = SessionListLineItemsParams.builder().build();
        List<LineItem> lineItems = session.listLineItems(params).getData();
        List<OrderItem> orderItems = new ArrayList<>();

        for (LineItem item : lineItems)
        {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(newOrder);
            orderItem.setProductName(item.getDescription());
            orderItem.setQuantity(item.getQuantity());
            orderItems.add(orderItem);
        }

        return orderItems;
    }

    private Order newOrder(Customer customer) {
        // new order creation need to convert cents
        Order newOrder = new Order();
        newOrder.setCustomer(customer);
        newOrder.setPaymentStatus("PAID");
        newOrder.setOrderDate(LocalDateTime.now());
        // newOrder.setStripeSessionId(); NEED TO IMPLEMENT

        // NOT HERE BUT NEED TO CHANGE STOCK

        // race conditions?



        return newOrder;
    }

}