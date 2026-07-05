package com.investmentresearch.service;

import com.investmentresearch.dto.AiChatRequest;

import java.util.UUID;

public interface AiService {

    Object analyzeStock(String ticker, String email);

    Object chatWithAi(AiChatRequest request, String email);

    Object getPortfolioAnalysis(UUID portfolioId, String email);

    Object getHealth();
}
