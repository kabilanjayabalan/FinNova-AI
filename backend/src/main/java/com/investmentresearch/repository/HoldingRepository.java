package com.investmentresearch.repository;

import com.investmentresearch.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, UUID> {
    List<Holding> findByPortfolioId(UUID portfolioId);
    Optional<Holding> findByPortfolioIdAndTicker(UUID portfolioId, String ticker);
    List<Holding> findByPortfolioIdAndPortfolioUserId(UUID portfolioId, UUID userId);
}
