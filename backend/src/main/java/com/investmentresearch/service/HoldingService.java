package com.investmentresearch.service;

import com.investmentresearch.dto.*;

import java.util.List;
import java.util.UUID;

public interface HoldingService {

    List<HoldingResponse> getHoldings(UUID portfolioId, String email);

    HoldingResponse addHolding(UUID portfolioId, HoldingRequest request, String email);

    HoldingResponse updateHolding(UUID holdingId, UpdateHoldingRequest request, String email);

    void deleteHolding(UUID holdingId, String email);

    List<TransactionResponse> getTransactions(UUID holdingId);

    TransactionResponse addTransaction(UUID holdingId, TransactionRequest request, String email);
}
