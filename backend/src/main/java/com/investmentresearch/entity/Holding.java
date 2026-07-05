package com.investmentresearch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "holdings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(nullable = false, length = 20)
    private String ticker;

    @Column(nullable = false, length = 100)
    private String companyName;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal shares;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal averageCost;

    @Column(length = 50)
    private String sector;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
