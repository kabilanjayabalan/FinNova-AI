package com.investmentresearch.controller;

import com.investmentresearch.dto.ApiResponse;
import com.investmentresearch.dto.WatchlistItemRequest;
import com.investmentresearch.dto.WatchlistItemResponse;
import com.investmentresearch.service.WatchlistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WatchlistItemResponse>>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<WatchlistItemResponse> watchlist = watchlistService.getWatchlist(userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Watchlist retrieved successfully", watchlist));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WatchlistItemResponse>> addToWatchlist(
            @Valid @RequestBody WatchlistItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        WatchlistItemResponse item = watchlistService.addToWatchlist(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Ticker added to watchlist successfully", item));
    }

    @DeleteMapping("/{ticker}")
    public ResponseEntity<ApiResponse<Void>> removeFromWatchlist(
            @PathVariable String ticker,
            @AuthenticationPrincipal UserDetails userDetails) {
        watchlistService.removeFromWatchlist(ticker, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Ticker removed from watchlist successfully", null));
    }

    @GetMapping("/{ticker}/status")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> isWatched(
            @PathVariable String ticker,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean watched = watchlistService.isWatched(ticker, userDetails.getUsername());
        return ResponseEntity.ok(new ApiResponse<>(true, "Watchlist status retrieved", Map.of("watched", watched)));
    }
}
