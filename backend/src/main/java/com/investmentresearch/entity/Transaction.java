package com.investmentresearch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "holding_id", nullable = false)
    private Holding holding;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal shares;

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal pricePerShare;

    @Column(nullable = false)
    private LocalDate transactionDate;

    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        BUY, SELL
    }
}
