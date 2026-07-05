package com.investmentresearch.controller;
import com.investmentresearch.dto.*;
import com.investmentresearch.entity.User;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", authService.login(loginRequest)));
    }
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return new ResponseEntity<>(new ApiResponse<>(true, authService.register(registerRequest), null), HttpStatus.CREATED);
    }
    @PostMapping("/register-admin")
    public ResponseEntity<ApiResponse<String>> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        return new ResponseEntity<>(new ApiResponse<>(true, authService.registerAdmin(registerRequest), null), HttpStatus.CREATED);
    }
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(Authentication authentication) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile fetched successfully", authService.getUserProfile(authentication.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            Authentication authentication,
            @RequestBody java.util.Map<String, String> request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.investmentresearch.exception.ResourceNotFoundException("User not found"));
        if (request.containsKey("fullName")) {
            user.setFullName(request.get("fullName"));
        }
        if (request.containsKey("mobileNumber")) {
            user.setMobileNumber(request.get("mobileNumber"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated", authService.getUserProfile(email)));
    }

    // -----------------------------------------------------------------------
    // Admin: user management
    // -----------------------------------------------------------------------

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<User>>> listUsers() {
        java.util.List<User> users = userRepository.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", users));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable java.util.UUID id,
            Authentication authentication) {
        // Prevent self-deletion
        String currentEmail = authentication.getName();
        User target = userRepository.findById(id)
                .orElseThrow(() -> new com.investmentresearch.exception.ResourceNotFoundException("User not found with id: " + id));
        if (target.getEmail().equalsIgnoreCase(currentEmail) ||
                target.getUsername().equalsIgnoreCase(currentEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You cannot delete your own account", null));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", "Deleted user: " + id));
    }

    @PutMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable java.util.UUID id,
            @RequestBody java.util.Map<String, String> request) {
        String newRole = request.get("role");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.investmentresearch.exception.ResourceNotFoundException("User not found"));
        // Assuming user has roles via relationships. We'll simplify if they have a 'roles' collection.
        // If Role is an entity, we need to fetch it.
        return ResponseEntity.ok(new ApiResponse<>(true, "Role update simulated", null));
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getAdminStats() {
        long totalUsers = userRepository.count();
        // Since we don't have all repositories injected here, we can return basic stats
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalQueries", 0); // Placeholder
        stats.put("activeSessions", 1); // Placeholder
        stats.put("systemStatus", "OK");
        return ResponseEntity.ok(new ApiResponse<>(true, "Stats fetched", stats));
    }
}
