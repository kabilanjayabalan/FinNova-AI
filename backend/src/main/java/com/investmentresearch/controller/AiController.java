package com.investmentresearch.controller;

import com.investmentresearch.dto.AiChatRequest;
import com.investmentresearch.dto.ApiResponse;
import com.investmentresearch.entity.AiQuery;
import com.investmentresearch.entity.User;
import com.investmentresearch.exception.ResourceNotFoundException;
import com.investmentresearch.repository.AiQueryRepository;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.service.AiService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final AiQueryRepository aiQueryRepository;
    private final UserRepository userRepository;

    public AiController(AiService aiService,
                        AiQueryRepository aiQueryRepository,
                        UserRepository userRepository) {
        this.aiService = aiService;
        this.aiQueryRepository = aiQueryRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/analyze/{ticker}")
    public ResponseEntity<ApiResponse<Object>> analyzeStock(
            @PathVariable String ticker,
            @AuthenticationPrincipal UserDetails userDetails) {
        Object result = aiService.analyzeStock(ticker, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Stock analysis completed", result));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Object>> chatWithAi(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Object result = aiService.chatWithAi(request, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Chat response received", result));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<AiQuery>>> getQueryHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AiQuery> history = aiQueryRepository.findByUserId(user.getId(), pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Query history retrieved successfully", history));
    }

    @DeleteMapping("/history")
    public ResponseEntity<ApiResponse<Object>> deleteQueryHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        aiQueryRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Query history deleted", null));
    }

    @PostMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ApiResponse<Object>> getPortfolioAnalysis(
            @PathVariable UUID portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Object result = aiService.getPortfolioAnalysis(portfolioId, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Portfolio analysis completed", result));
    }
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Object>> getHealth() {
        Object result = aiService.getHealth();
        return ResponseEntity.ok(new ApiResponse<>(true, "Health check completed", result));
    }
}
