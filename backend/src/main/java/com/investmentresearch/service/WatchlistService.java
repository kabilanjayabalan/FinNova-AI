package com.investmentresearch.service;

import com.investmentresearch.dto.WatchlistItemRequest;
import com.investmentresearch.dto.WatchlistItemResponse;

import java.util.List;

public interface WatchlistService {

    List<WatchlistItemResponse> getWatchlist(String email);

    WatchlistItemResponse addToWatchlist(WatchlistItemRequest request, String email);

    void removeFromWatchlist(String ticker, String email);

    boolean isWatched(String ticker, String email);
}
