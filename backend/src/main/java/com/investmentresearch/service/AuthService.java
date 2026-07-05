package com.investmentresearch.service;
import com.investmentresearch.dto.*;
public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    String register(RegisterRequest registerRequest);
    String registerAdmin(RegisterRequest registerRequest);
    UserProfileDto getUserProfile(String email);
}
