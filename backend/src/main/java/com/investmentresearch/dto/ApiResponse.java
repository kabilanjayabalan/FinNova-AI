package com.investmentresearch.dto;
import lombok.Data;
@Data
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private java.time.LocalDateTime timestamp;
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = java.time.LocalDateTime.now();
    }
}
