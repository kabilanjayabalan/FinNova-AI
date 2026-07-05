package com.investmentresearch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistItemRequest {

    @NotBlank(message = "Ticker symbol is required")
    @Size(max = 20, message = "Ticker must not exceed 20 characters")
    private String ticker;

    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String companyName;

    private String notes;
}
