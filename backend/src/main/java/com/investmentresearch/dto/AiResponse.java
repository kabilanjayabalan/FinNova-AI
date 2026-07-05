package com.investmentresearch.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiResponse {

    private boolean success;
    private Object data;
    private String message;
}
