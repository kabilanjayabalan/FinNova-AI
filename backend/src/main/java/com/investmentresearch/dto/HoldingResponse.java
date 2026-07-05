package com.investmentresearch.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoldingResponse {

    private UUID id;
    private String ticker;
    private String companyName;
    private BigDecimal shares;
    private BigDecimal averageCost;
    private String sector;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
}
