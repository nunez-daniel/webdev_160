package com.ofs_160.webdev.Config;


import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.Arrays;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    private String redirect_url = "http://localhost:5173/catalog";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {

        httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(req -> req

                        .requestMatchers(HttpMethod.GET, "/products", "/products/{id}", "products/{productId}/image").permitAll()
                        .requestMatchers("/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"/login").permitAll()
                        .requestMatchers(HttpMethod.POST,"/logout").permitAll()
                        .requestMatchers(HttpMethod.POST,"/signup").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/orders").hasAnyAuthority("CUSTOMER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,"/products2").permitAll()
                        .requestMatchers(HttpMethod.GET,"/products2/suggest").permitAll()

                        .requestMatchers(HttpMethod.POST,"/products").hasAnyAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/delivery/{orderId}/{carId}").hasAnyAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET,"/loaded/{carId}").hasAnyAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET,"/create/car").hasAnyAuthority("ADMIN")

                        .requestMatchers(HttpMethod.POST,"/webhook").permitAll()
                        .requestMatchers(HttpMethod.GET,"/webhook").permitAll()


                        .requestMatchers(HttpMethod.GET,"/orders-all").hasAnyAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET,"/orders-all-status").hasAnyAuthority("ADMIN")

                        // /me
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .successHandler((request, response, authentication) -> response.setStatus(HttpServletResponse.SC_OK)))
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(myAuthenticationSuccessHandler()));

        // TODO.. Logout success handler

        return httpSecurity.build();

    }

    // only do this on successful login
    // else we can't redirect

    @Bean
    public AuthenticationSuccessHandler myAuthenticationSuccessHandler(){
        return new SimpleUrlAuthenticationSuccessHandler(redirect_url);
    }

    // https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html#:~:text=%40Bean%0AUrlBasedCorsConfigurationSource%20corsConfigurationSource,configuration)%3B%0A%20%20%20%20return%20source%3B%0A%7D

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider()
    {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(new BCryptPasswordEncoder(15)); // anyVal
        return  provider;
    }

}

