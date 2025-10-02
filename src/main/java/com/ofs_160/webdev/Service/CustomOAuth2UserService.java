package com.ofs_160.webdev.Service;


import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;


@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final CustomerService customerService;
    Customer customer;

    public CustomOAuth2UserService(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
    {
        OAuth2User oauth2User = super.loadUser(userRequest);


        // can also fetch them sub Id but email should be unique always
        // both actually should be unique in their respective sense
        String username = oauth2User.getAttribute("email");
        String first_name = oauth2User.getAttribute("given_name");
        String last_name = oauth2User.getAttribute("family_name");

        Customer existingCustomer = customerService.findByEmail(username);


        if(existingCustomer == null)
        {
            customer  = registerCustomer(username, first_name, last_name);
        }else
        {
            // pulls from google so user changes from account would be reflected here
            customer = updateCustomerInfo(existingCustomer, first_name, last_name);
        }


        return new CustomerDetails(customer, oauth2User);
    }

    private Customer updateCustomerInfo(Customer customer, String firstName, String lastName)
    {

        // check for account changes
        customer.setFirst_name(firstName);
        customer.setLast_name(lastName);
        customerService.save(customer);

        return customer;
    }

    private Customer registerCustomer(String email, String first_name, String last_name)
    {
        Customer newCustomer = new Customer();
        // Both username, email with be same utilized value -> oauth2
        newCustomer.setEmail(email);
        newCustomer.setFirst_name(first_name);
        newCustomer.setLast_name(last_name);
        newCustomer.setRole("CUSTOMER");
        newCustomer.setUsername(email);
        newCustomer.setPasscode(null); // Not needed in db
        return customerService.save(newCustomer);
    }
}