package com.investmentresearch.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistItemResponse {

    private UUID id;
    private String ticker;
    private String companyName;
    private String notes;
    private LocalDateTime addedAt;
}
