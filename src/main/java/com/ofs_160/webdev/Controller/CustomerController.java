package com.ofs_160.webdev.Controller;



import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.Product;
import com.ofs_160.webdev.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CustomerController {


    @Autowired
    CustomerService customerService;

    // Need... Implement ResponseEntity to return 200 or 404 .. 201 .. etc
    // Listing all the customers, maybe change so no one but OWNER has access?
    @GetMapping("/customer")
    public ResponseEntity<List<Customer>> getCustomer()
    {
        return new ResponseEntity<>( customerService.getAllCustomers(), HttpStatus.OK);
    }

    @GetMapping("/customer/{id}")
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


    @PostMapping("/customer")
    public ResponseEntity<String> insertCustomer(@RequestBody Customer customer)
    {
        customerService.insertCustomer(customer);
        return new ResponseEntity<>("Customer Saved", HttpStatus.CREATED);
    }


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


  /*@GetMapping("/customer-profile")
    public String getCustomerProfile(OAuth2AuthenticationToken token, )
    {

    }*/




}
