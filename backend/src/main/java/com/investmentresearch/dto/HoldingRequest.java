package com.investmentresearch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingRequest {

    @NotBlank(message = "Ticker symbol is required")
    @Size(max = 20, message = "Ticker must not exceed 20 characters")
    private String ticker;

    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String companyName;

    @NotNull(message = "Number of shares is required")
    @Positive(message = "Shares must be a positive number")
    private BigDecimal shares;

    @NotNull(message = "Average cost is required")
    @Positive(message = "Average cost must be a positive number")
    private BigDecimal averageCost;

    @Size(max = 50, message = "Sector must not exceed 50 characters")
    private String sector;
}
