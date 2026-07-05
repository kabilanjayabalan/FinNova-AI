package com.investmentresearch.controller;

import com.investmentresearch.dto.ApiResponse;
import com.investmentresearch.dto.PortfolioRequest;
import com.investmentresearch.dto.PortfolioResponse;
import com.investmentresearch.dto.PortfolioWithHoldingsResponse;
import com.investmentresearch.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PortfolioResponse>>> getUserPortfolios(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PortfolioResponse> portfolios = portfolioService.getUserPortfolios(userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Portfolios retrieved successfully", portfolios));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PortfolioResponse>> createPortfolio(
            @Valid @RequestBody PortfolioRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioResponse portfolio = portfolioService.createPortfolio(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Portfolio created successfully", portfolio));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PortfolioWithHoldingsResponse>> getPortfolioById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioWithHoldingsResponse portfolio = portfolioService.getPortfolioById(id, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Portfolio retrieved successfully", portfolio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PortfolioResponse>> updatePortfolio(
            @PathVariable UUID id,
            @Valid @RequestBody PortfolioRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PortfolioResponse portfolio = portfolioService.updatePortfolio(id, request, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Portfolio updated successfully", portfolio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePortfolio(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        portfolioService.deletePortfolio(id, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Portfolio deleted successfully", null));
    }
}
