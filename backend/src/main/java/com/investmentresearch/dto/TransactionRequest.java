package com.investmentresearch.dto;

import com.investmentresearch.entity.Transaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionRequest {

    @NotNull(message = "Transaction type is required")
    private TransactionType type;

    @NotNull(message = "Number of shares is required")
    @Positive(message = "Shares must be a positive number")
    private BigDecimal shares;

    @NotNull(message = "Price per share is required")
    @Positive(message = "Price per share must be a positive number")
    private BigDecimal pricePerShare;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private String notes;
}
