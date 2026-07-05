package com.investmentresearch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisRequest {

    @NotBlank(message = "Ticker symbol is required")
    private String ticker;
}
