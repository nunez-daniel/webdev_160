package com.ofs_160.webdev.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ofs_160.webdev.ExceptionHandler.DuplicateCustomerException;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Repository.CustomerRepository;


@Service
public class CustomerService {


    @Autowired
    CustomerRepository customerRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(15);

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer findCustomerById(int id) {
        return customerRepository.findById(id).orElse(null);
    }

    public void deleteCustomerById(int id) {
        customerRepository.deleteById(id);
    }

    public void insertCustomer(Customer customer) {
        customerRepository.save(customer);
    }

    public void updateCustomer(Customer customer) {
        customerRepository.save(customer);
    }

    public void registerCustomer(Customer customer)
    {

        Customer existingCustomer = customerRepository.findByEmail(customer.getEmail());

        if (existingCustomer != null) {
            throw new DuplicateCustomerException("This email " + customer.getEmail() + " is already registered login using account or google");
        }

        customer.setPassword(bCryptPasswordEncoder.encode(customer.getPassword()));
        customer.setRole("CUSTOMER");
        customer.setFull_name(customer.getFull_name());
        customer.setUsername(customer.getUsername());
        customer.setUsername(customer.getEmail());
        customerRepository.save(customer);
    }

    public Customer findByUsername(String username) {
        return customerRepository.findByUsername(username);
    }

    public Customer findByEmail(String username) {
        return customerRepository.findByEmail(username);
    }

    public Customer save(Customer customer) {
        // repeated code for save, register, signup check for dupes
        return customerRepository.save(customer);
    }


}
