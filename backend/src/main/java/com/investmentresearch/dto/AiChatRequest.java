package com.investmentresearch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatRequest {

    @NotBlank(message = "Message is required")
    private String message;

    private List<Map<String, Object>> history;

    private String ticker;
}
