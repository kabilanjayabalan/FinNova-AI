package com.investmentresearch.repository;

import com.investmentresearch.entity.AiQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiQueryRepository extends JpaRepository<AiQuery, UUID> {
    List<AiQuery> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Page<AiQuery> findByUserId(UUID userId, Pageable pageable);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserId(UUID userId);
}
