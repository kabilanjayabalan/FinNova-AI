package com.investmentresearch.dto;
import lombok.Data;
@Data
public class UserProfileDto {
    private String id;
    private String fullName;
    private String username;
    private String email;
    private String mobileNumber;
    private java.util.Set<String> roles;
}
