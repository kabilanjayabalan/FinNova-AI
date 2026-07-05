package com.investmentresearch.repository;

import com.investmentresearch.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);
    Optional<Portfolio> findByIdAndUserId(UUID id, UUID userId);
    boolean existsByNameAndUserId(String name, UUID userId);
}
