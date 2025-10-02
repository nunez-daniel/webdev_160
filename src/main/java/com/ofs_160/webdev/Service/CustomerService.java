package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Repository.CustomerRepository;
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

    public Customer registerCustomer(Customer customer)
    {
        customer.setPasscode(bCryptPasswordEncoder.encode(customer.getPasscode()));
        customer.setRole("CUSTOMER");
        return customerRepository.save(customer);
    }

    public Customer findByEmail(String username) {
        return customerRepository.findByEmail(username);
    }

    public Customer save(Customer customer) {
        // repeated code for save, register, signup check for dupes
        return customerRepository.save(customer);
    }
}
