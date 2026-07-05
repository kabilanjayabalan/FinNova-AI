package com.investmentresearch.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    private String username;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    private String mobileNumber;
    @NotBlank(message = "Password is required")
    @Size(min = 6)
    private String password;
}
