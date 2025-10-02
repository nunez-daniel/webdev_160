package com.ofs_160.webdev.Controller;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Service.CustomerDetailsService;
import com.ofs_160.webdev.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CustomerController {


    @Autowired
    CustomerService customerService;

    // Need... Implement ResponseEntity to return 200 or 404 .. 201 .. etc
    // Listing all the customers, maybe change so no one but OWNER has access?
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/customer")
    public ResponseEntity<List<Customer>> getCustomer()
    {
        return new ResponseEntity<>( customerService.getAllCustomers(), HttpStatus.OK);
    }

    @GetMapping("/customer/{id}")
    @PreAuthorize("isAuthenticated() and #id == principal.customer.customer_id")
    public ResponseEntity<Customer> getCustomerById(@PathVariable int id)
    {

        Customer c = customerService.findCustomerById(id);
        if(c == null)
        {
            return ResponseEntity.notFound().build(); // 404
        }else
        {
            return ResponseEntity.ok(c);
        }

    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/customer/{id}")
    public ResponseEntity<String> deleteCustomerById(@PathVariable int id)
    {
        Customer c  = customerService.findCustomerById(id);

        if(c != null)
        {
            customerService.deleteCustomerById(id);
            return new ResponseEntity<>("Customer Deleted", HttpStatus.OK);
        }else
        {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    // Use "/register" this will add to db without spring security
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/customer")
    public ResponseEntity<String> insertCustomer(@RequestBody Customer customer)
    {
        customerService.insertCustomer(customer);
        return new ResponseEntity<>("Customer Saved", HttpStatus.CREATED);
    }


    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/customer")
    public ResponseEntity<String> updateCustomer(@RequestBody Customer customer)
    {
        Customer c = customerService.findCustomerById(customer.getCustomer_id());
        if(c != null)
        {
            customerService.updateCustomer(customer);
            return new ResponseEntity<>("Customer Updated", HttpStatus.OK);
        } else
        {
            // No customer found to update
            return new ResponseEntity<>("Customer NOT Updated", HttpStatus.NOT_FOUND);
        }
    }

    // Need response entity pattern
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/register")
    public Customer register(@RequestBody Customer customer)
    {
        return customerService.registerCustomer(customer);
    }


    // purely a testing api just wanted to see if any difference in call type
    @GetMapping("/me")
    public String getPrincipalInfo(@AuthenticationPrincipal CustomerDetails principal) {

        String username = principal.getUsername();
        String first_name = principal.getCustomer().getFirst_name();
        String last_name = principal.getCustomer().getLast_name();
        String email = principal.getCustomer().getEmail();
        String role = principal.getCustomer().getRole();
        int id = principal.getCustomer().getCustomer_id();
        String authority = principal.getAuthorities().toString();

        return "CUSTOMER Info: " + authority +
                " id: " + id +
                " username: " + username +
                " role: " + role +
                " first_name: " + first_name +
                " last_name: " + last_name +
                " email: " + email;





    }


}
