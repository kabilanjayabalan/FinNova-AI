package com.investmentresearch.service.impl;
import com.investmentresearch.dto.*;
import com.investmentresearch.entity.*;
import com.investmentresearch.exception.BadRequestException;
import com.investmentresearch.repository.*;
import com.investmentresearch.security.JwtUtil;
import com.investmentresearch.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.stream.Collectors;
@Service
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    public AuthServiceImpl(AuthenticationManager authenticationManager, UserRepository userRepository,
                           RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        return new AuthResponse(jwtUtil.generateToken(auth));
    }
    @Override
    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) { throw new BadRequestException("Username is already taken!"); }
        if (userRepository.existsByEmail(registerRequest.getEmail())) { throw new BadRequestException("Email is already taken!"); }
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setMobileNumber(registerRequest.getMobileNumber());
        Role userRole = roleRepository.findByName("USER").orElseGet(() -> {
            Role newRole = new Role(); newRole.setName("USER"); return roleRepository.save(newRole);
        });
        user.setRoles(Collections.singleton(userRole));
        userRepository.save(user);
        return "User registered successfully!";
    }
    @Override
    public String registerAdmin(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) { throw new BadRequestException("Username is already taken!"); }
        if (userRepository.existsByEmail(registerRequest.getEmail())) { throw new BadRequestException("Email is already taken!"); }
        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setMobileNumber(registerRequest.getMobileNumber());
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role newRole = new Role(); newRole.setName("ADMIN"); return roleRepository.save(newRole);
        });
        user.setRoles(Collections.singleton(adminRole));
        userRepository.save(user);
        return "Admin registered successfully!";
    }
    @Override
    public UserProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadRequestException("User not found"));
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId().toString());
        dto.setFullName(user.getFullName());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setMobileNumber(user.getMobileNumber());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return dto;
    }
}
