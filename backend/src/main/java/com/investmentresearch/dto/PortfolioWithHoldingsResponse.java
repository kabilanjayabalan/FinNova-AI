package com.investmentresearch.dto;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioWithHoldingsResponse extends PortfolioResponse {

    private List<HoldingResponse> holdings;

    @Builder(builderMethodName = "withHoldingsBuilder")
    public PortfolioWithHoldingsResponse(
            java.util.UUID id,
            String name,
            String description,
            String currency,
            int holdingsCount,
            java.time.LocalDateTime createdAt,
            List<HoldingResponse> holdings) {
        super(id, name, description, currency, holdingsCount, createdAt);
        this.holdings = holdings;
    }
}
