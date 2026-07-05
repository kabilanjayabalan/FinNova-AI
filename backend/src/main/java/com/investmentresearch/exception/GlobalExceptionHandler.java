package com.investmentresearch.exception;
import com.investmentresearch.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.HashMap;
import java.util.Map;
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(new ApiResponse<>(false, "Validation Failed", errors), HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(BadRequestException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, "An error occurred: " + ex.getMessage(), null), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
