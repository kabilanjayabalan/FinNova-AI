package com.investmentresearch.controller;

import com.investmentresearch.dto.*;
import com.investmentresearch.service.HoldingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/holdings")
public class HoldingController {

    private final HoldingService holdingService;

    public HoldingController(HoldingService holdingService) {
        this.holdingService = holdingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HoldingResponse>>> getHoldings(
            @PathVariable UUID portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<HoldingResponse> holdings = holdingService.getHoldings(portfolioId, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Holdings retrieved successfully", holdings));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HoldingResponse>> addHolding(
            @PathVariable UUID portfolioId,
            @Valid @RequestBody HoldingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        HoldingResponse holding = holdingService.addHolding(portfolioId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Holding added successfully", holding));
    }

    @PutMapping("/{holdingId}")
    public ResponseEntity<ApiResponse<HoldingResponse>> updateHolding(
            @PathVariable UUID portfolioId,
            @PathVariable UUID holdingId,
            @Valid @RequestBody UpdateHoldingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        HoldingResponse holding = holdingService.updateHolding(holdingId, request, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Holding updated successfully", holding));
    }

    @DeleteMapping("/{holdingId}")
    public ResponseEntity<ApiResponse<Void>> deleteHolding(
            @PathVariable UUID portfolioId,
            @PathVariable UUID holdingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        holdingService.deleteHolding(holdingId, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Holding deleted successfully", null));
    }

    @GetMapping("/{holdingId}/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @PathVariable UUID portfolioId,
            @PathVariable UUID holdingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TransactionResponse> transactions = holdingService.getTransactions(holdingId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Transactions retrieved successfully", transactions));
    }

    @PostMapping("/{holdingId}/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> addTransaction(
            @PathVariable UUID portfolioId,
            @PathVariable UUID holdingId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse transaction = holdingService.addTransaction(holdingId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Transaction added successfully", transaction));
    }
}
