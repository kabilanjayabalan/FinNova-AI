package com.investmentresearch.service.impl;

import com.investmentresearch.dto.HoldingResponse;
import com.investmentresearch.dto.PortfolioRequest;
import com.investmentresearch.dto.PortfolioResponse;
import com.investmentresearch.dto.PortfolioWithHoldingsResponse;
import com.investmentresearch.entity.Portfolio;
import com.investmentresearch.entity.User;
import com.investmentresearch.exception.BadRequestException;
import com.investmentresearch.exception.ResourceNotFoundException;
import com.investmentresearch.repository.PortfolioRepository;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.service.PortfolioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    public PortfolioServiceImpl(PortfolioRepository portfolioRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PortfolioResponse> getUserPortfolios(String email) {
        User user = findUserByEmail(email);
        return portfolioRepository.findByUserId(user.getId()).stream()
                .map(this::mapToPortfolioResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PortfolioWithHoldingsResponse getPortfolioById(UUID portfolioId, String email) {
        User user = findUserByEmail(email);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        List<HoldingResponse> holdingResponses = portfolio.getHoldings().stream()
                .map(holding -> HoldingResponse.builder()
                        .id(holding.getId())
                        .ticker(holding.getTicker())
                        .companyName(holding.getCompanyName())
                        .shares(holding.getShares())
                        .averageCost(holding.getAverageCost())
                        .sector(holding.getSector())
                        .totalCost(holding.getShares().multiply(holding.getAverageCost()))
                        .createdAt(holding.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return new PortfolioWithHoldingsResponse(
                portfolio.getId(),
                portfolio.getName(),
                portfolio.getDescription(),
                portfolio.getCurrency(),
                holdingResponses.size(),
                portfolio.getCreatedAt(),
                holdingResponses
        );
    }

    @Override
    public PortfolioResponse createPortfolio(PortfolioRequest request, String email) {
        User user = findUserByEmail(email);

        if (portfolioRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new BadRequestException("A portfolio with the name '" + request.getName() + "' already exists.");
        }

        String currency = request.getCurrency() != null ? request.getCurrency() : "USD";

        Portfolio portfolio = Portfolio.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .currency(currency)
                .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        return mapToPortfolioResponse(saved);
    }

    @Override
    public PortfolioResponse updatePortfolio(UUID portfolioId, PortfolioRequest request, String email) {
        User user = findUserByEmail(email);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        if (!portfolio.getName().equals(request.getName()) &&
                portfolioRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new BadRequestException("A portfolio with the name '" + request.getName() + "' already exists.");
        }

        portfolio.setName(request.getName());
        portfolio.setDescription(request.getDescription());
        if (request.getCurrency() != null) {
            portfolio.setCurrency(request.getCurrency());
        }

        Portfolio saved = portfolioRepository.save(portfolio);
        return mapToPortfolioResponse(saved);
    }

    @Override
    public void deletePortfolio(UUID portfolioId, String email) {
        User user = findUserByEmail(email);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
        portfolioRepository.delete(portfolio);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private PortfolioResponse mapToPortfolioResponse(Portfolio portfolio) {
        return PortfolioResponse.builder()
                .id(portfolio.getId())
                .name(portfolio.getName())
                .description(portfolio.getDescription())
                .currency(portfolio.getCurrency())
                .holdingsCount(portfolio.getHoldings() != null ? portfolio.getHoldings().size() : 0)
                .createdAt(portfolio.getCreatedAt())
                .build();
    }
}
