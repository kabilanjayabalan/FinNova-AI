package com.investmentresearch.dto;

import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHoldingRequest {

    @Positive(message = "Shares must be a positive number")
    private BigDecimal shares;

    @Positive(message = "Average cost must be a positive number")
    private BigDecimal averageCost;
}
