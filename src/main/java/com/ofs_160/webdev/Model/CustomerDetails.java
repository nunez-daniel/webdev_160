package com.ofs_160.webdev.Model;


import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;


public class CustomerDetails implements UserDetails, OAuth2User {

    @Getter
    private Customer customer;
    private Map<String, Object> attributes;


    public CustomerDetails(Customer customer)
    {
        // System.out.println("customer details called");
        this.customer = customer;
    }

    public CustomerDetails(Customer customer, OAuth2User oauth2User) {
        this.customer = customer;
    }


    @Override
    public Map<String, Object> getAttributes() {
        return attributes;

    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority(customer.getRole()));
    }

    @Override
    public String getPassword() {
        return customer.getPasscode();
    }

    @Override
    public String getUsername() {
        return customer.getUsername();
    }

    @Override
    public String getName() {
        return customer.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
