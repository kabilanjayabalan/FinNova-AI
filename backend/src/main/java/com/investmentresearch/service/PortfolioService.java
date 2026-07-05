package com.investmentresearch.service;

import com.investmentresearch.dto.PortfolioRequest;
import com.investmentresearch.dto.PortfolioResponse;
import com.investmentresearch.dto.PortfolioWithHoldingsResponse;

import java.util.List;
import java.util.UUID;

public interface PortfolioService {

    List<PortfolioResponse> getUserPortfolios(String email);

    PortfolioWithHoldingsResponse getPortfolioById(UUID portfolioId, String email);

    PortfolioResponse createPortfolio(PortfolioRequest request, String email);

    PortfolioResponse updatePortfolio(UUID portfolioId, PortfolioRequest request, String email);

    void deletePortfolio(UUID portfolioId, String email);
}
