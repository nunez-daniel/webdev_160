package com.ofs_160.webdev.Service;

import com.ofs_160.webdev.Model.Customer;
import com.ofs_160.webdev.Model.CustomerDetails;
import com.ofs_160.webdev.Repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomerDetailsService  implements UserDetailsService {

    @Autowired
    private CustomerRepository repo;


    @Override
    public UserDetails loadUserByUsername(String username)
    {
        // System.out.println("load User By Name Called");
        Customer customer = repo.findByUsername(username);

        if(customer == null)
        {
            // here would would redirect to register or confirm inputs is rights
            throw  new UsernameNotFoundException("404 not found in cd");
        }

        return new CustomerDetails(customer);
    }
}
