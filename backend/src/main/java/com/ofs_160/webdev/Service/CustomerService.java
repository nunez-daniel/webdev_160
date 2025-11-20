package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.ExceptionHandler.DuplicateCustomerException;
import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Repository.CustomerRepository;
import com.ofs_160.webdev.ExceptionHandler.CustomerNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CustomerService {


    @Autowired
    CustomerRepository customerRepository;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder(15);

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer findCustomerById(int id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new CustomerNotFoundException(Integer.toString(id)));
    }

    public void deleteCustomerById(int id) {
        if (!customerRepository.existsById(id)) {
            throw new CustomerNotFoundException(Integer.toString(id));
        }
        customerRepository.deleteById(id);
        
    }

    public void insertCustomer(Customer customer) {
        customerRepository.save(customer);
    }

    public void updateCustomer(Customer customer) {
        if (!customerRepository.existsById(customer.getCustomer_id())) {
            throw new CustomerNotFoundException(Integer.toString(customer.getCustomer_id()));
        }
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

    public Customer findByEmail(String username) {
        return customerRepository.findByEmail(username);
    }

    public Customer save(Customer customer) {
        // repeated code for save, register, signup check for dupes
        return customerRepository.save(customer);
    }


}
