package com.investmentresearch.repository;

import com.investmentresearch.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, UUID> {
    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(UUID userId);
    Optional<WatchlistItem> findByUserIdAndTicker(UUID userId, String ticker);
    boolean existsByUserIdAndTicker(UUID userId, String ticker);

    @Transactional
    void deleteByUserIdAndTicker(UUID userId, String ticker);
}
