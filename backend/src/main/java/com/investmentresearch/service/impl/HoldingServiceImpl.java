package com.investmentresearch.service.impl;

import com.investmentresearch.dto.*;
import com.investmentresearch.entity.Holding;
import com.investmentresearch.entity.Portfolio;
import com.investmentresearch.entity.Transaction;
import com.investmentresearch.entity.User;
import com.investmentresearch.exception.BadRequestException;
import com.investmentresearch.exception.ResourceNotFoundException;
import com.investmentresearch.repository.HoldingRepository;
import com.investmentresearch.repository.PortfolioRepository;
import com.investmentresearch.repository.TransactionRepository;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.service.HoldingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class HoldingServiceImpl implements HoldingService {

    private final HoldingRepository holdingRepository;
    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public HoldingServiceImpl(HoldingRepository holdingRepository,
                               PortfolioRepository portfolioRepository,
                               TransactionRepository transactionRepository,
                               UserRepository userRepository) {
        this.holdingRepository = holdingRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HoldingResponse> getHoldings(UUID portfolioId, String email) {
        User user = findUserByEmail(email);
        verifyPortfolioOwnership(portfolioId, user.getId());
        return holdingRepository.findByPortfolioIdAndPortfolioUserId(portfolioId, user.getId()).stream()
                .map(this::mapToHoldingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HoldingResponse addHolding(UUID portfolioId, HoldingRequest request, String email) {
        User user = findUserByEmail(email);
        Portfolio portfolio = verifyPortfolioOwnership(portfolioId, user.getId());

        if (holdingRepository.findByPortfolioIdAndTicker(portfolioId, request.getTicker().toUpperCase()).isPresent()) {
            throw new BadRequestException("A holding for ticker '" + request.getTicker() + "' already exists in this portfolio.");
        }

        Holding holding = Holding.builder()
                .portfolio(portfolio)
                .ticker(request.getTicker().toUpperCase())
                .companyName(request.getCompanyName() != null ? request.getCompanyName() : request.getTicker().toUpperCase())
                .shares(request.getShares())
                .averageCost(request.getAverageCost())
                .sector(request.getSector())
                .build();

        Holding saved = holdingRepository.save(holding);
        return mapToHoldingResponse(saved);
    }

    @Override
    public HoldingResponse updateHolding(UUID holdingId, UpdateHoldingRequest request, String email) {
        User user = findUserByEmail(email);
        Holding holding = holdingRepository.findById(holdingId)
                .orElseThrow(() -> new ResourceNotFoundException("Holding not found with id: " + holdingId));

        verifyPortfolioOwnership(holding.getPortfolio().getId(), user.getId());

        if (request.getShares() != null) {
            holding.setShares(request.getShares());
        }
        if (request.getAverageCost() != null) {
            holding.setAverageCost(request.getAverageCost());
        }

        Holding saved = holdingRepository.save(holding);
        return mapToHoldingResponse(saved);
    }

    @Override
    public void deleteHolding(UUID holdingId, String email) {
        User user = findUserByEmail(email);
        Holding holding = holdingRepository.findById(holdingId)
                .orElseThrow(() -> new ResourceNotFoundException("Holding not found with id: " + holdingId));
        verifyPortfolioOwnership(holding.getPortfolio().getId(), user.getId());
        holdingRepository.delete(holding);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(UUID holdingId) {
        return transactionRepository.findByHoldingIdOrderByTransactionDateDesc(holdingId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TransactionResponse addTransaction(UUID holdingId, TransactionRequest request, String email) {
        User user = findUserByEmail(email);
        Holding holding = holdingRepository.findById(holdingId)
                .orElseThrow(() -> new ResourceNotFoundException("Holding not found with id: " + holdingId));

        verifyPortfolioOwnership(holding.getPortfolio().getId(), user.getId());

        Transaction transaction = Transaction.builder()
                .holding(holding)
                .type(request.getType())
                .shares(request.getShares())
                .pricePerShare(request.getPricePerShare())
                .transactionDate(request.getTransactionDate())
                .notes(request.getNotes())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToTransactionResponse(saved);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Portfolio verifyPortfolioOwnership(UUID portfolioId, UUID userId) {
        return portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));
    }

    private HoldingResponse mapToHoldingResponse(Holding holding) {
        return HoldingResponse.builder()
                .id(holding.getId())
                .ticker(holding.getTicker())
                .companyName(holding.getCompanyName())
                .shares(holding.getShares())
                .averageCost(holding.getAverageCost())
                .sector(holding.getSector())
                .totalCost(holding.getShares().multiply(holding.getAverageCost()))
                .createdAt(holding.getCreatedAt())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .shares(transaction.getShares())
                .pricePerShare(transaction.getPricePerShare())
                .transactionDate(transaction.getTransactionDate())
                .totalValue(transaction.getShares().multiply(transaction.getPricePerShare()))
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
