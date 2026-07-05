package com.investmentresearch.config;

import com.investmentresearch.entity.Role;
import com.investmentresearch.entity.User;
import com.investmentresearch.repository.RoleRepository;
import com.investmentresearch.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Collections;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure roles exist
        Role userRole = roleRepository.findByName("USER").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("USER");
            return roleRepository.save(newRole);
        });

        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("ADMIN");
            return roleRepository.save(newRole);
        });

        // Ensure admin user exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setFullName("System Administrator");
            admin.setUsername("admin");
            admin.setEmail("admin@investmentresearch.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setMobileNumber("1234567890");
            admin.setRoles(Collections.singleton(adminRole));
            userRepository.save(admin);
            System.out.println("Admin user created with username 'admin' and password 'admin123'");
        }
    }
}
