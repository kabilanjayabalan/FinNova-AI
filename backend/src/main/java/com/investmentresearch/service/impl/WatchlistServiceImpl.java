package com.investmentresearch.service.impl;

import com.investmentresearch.dto.WatchlistItemRequest;
import com.investmentresearch.dto.WatchlistItemResponse;
import com.investmentresearch.entity.User;
import com.investmentresearch.entity.WatchlistItem;
import com.investmentresearch.exception.BadRequestException;
import com.investmentresearch.exception.ResourceNotFoundException;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.repository.WatchlistItemRepository;
import com.investmentresearch.service.WatchlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistItemRepository watchlistItemRepository;
    private final UserRepository userRepository;

    public WatchlistServiceImpl(WatchlistItemRepository watchlistItemRepository, UserRepository userRepository) {
        this.watchlistItemRepository = watchlistItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WatchlistItemResponse> getWatchlist(String email) {
        User user = findUserByEmail(email);
        return watchlistItemRepository.findByUserIdOrderByAddedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public WatchlistItemResponse addToWatchlist(WatchlistItemRequest request, String email) {
        User user = findUserByEmail(email);
        String ticker = request.getTicker().toUpperCase();

        if (watchlistItemRepository.existsByUserIdAndTicker(user.getId(), ticker)) {
            throw new BadRequestException("Ticker '" + ticker + "' is already in your watchlist.");
        }

        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .ticker(ticker)
                .companyName(request.getCompanyName())
                .notes(request.getNotes())
                .build();

        WatchlistItem saved = watchlistItemRepository.save(item);
        return mapToResponse(saved);
    }

    @Override
    public void removeFromWatchlist(String ticker, String email) {
        User user = findUserByEmail(email);
        String upperTicker = ticker.toUpperCase();

        if (!watchlistItemRepository.existsByUserIdAndTicker(user.getId(), upperTicker)) {
            throw new ResourceNotFoundException("Ticker '" + upperTicker + "' not found in your watchlist.");
        }

        watchlistItemRepository.deleteByUserIdAndTicker(user.getId(), upperTicker);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWatched(String ticker, String email) {
        User user = findUserByEmail(email);
        return watchlistItemRepository.existsByUserIdAndTicker(user.getId(), ticker.toUpperCase());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private WatchlistItemResponse mapToResponse(WatchlistItem item) {
        return WatchlistItemResponse.builder()
                .id(item.getId())
                .ticker(item.getTicker())
                .companyName(item.getCompanyName())
                .notes(item.getNotes())
                .addedAt(item.getAddedAt())
                .build();
    }
}
