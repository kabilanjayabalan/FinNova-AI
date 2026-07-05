package com.investmentresearch.dto;

import com.investmentresearch.entity.Transaction.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private UUID id;
    private TransactionType type;
    private BigDecimal shares;
    private BigDecimal pricePerShare;
    private LocalDate transactionDate;
    private BigDecimal totalValue;
    private String notes;
    private LocalDateTime createdAt;
}
