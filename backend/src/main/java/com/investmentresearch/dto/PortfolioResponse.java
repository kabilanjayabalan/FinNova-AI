package com.investmentresearch.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioResponse {

    private UUID id;
    private String name;
    private String description;
    private String currency;
    private int holdingsCount;
    private LocalDateTime createdAt;
}
