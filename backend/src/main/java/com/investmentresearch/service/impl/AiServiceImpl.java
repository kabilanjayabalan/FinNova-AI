package com.investmentresearch.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.investmentresearch.dto.AiChatRequest;
import com.investmentresearch.entity.AiQuery;
import com.investmentresearch.entity.Holding;
import com.investmentresearch.entity.Portfolio;
import com.investmentresearch.entity.User;
import com.investmentresearch.exception.ResourceNotFoundException;
import com.investmentresearch.repository.AiQueryRepository;
import com.investmentresearch.repository.HoldingRepository;
import com.investmentresearch.repository.PortfolioRepository;
import com.investmentresearch.repository.UserRepository;
import com.investmentresearch.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@Transactional
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    private final RestTemplate restTemplate;
    private final AiQueryRepository aiQueryRepository;
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    @Value("${ai.service.base-url:http://localhost:8001}")
    private String aiServiceBaseUrl;

    public AiServiceImpl(RestTemplate restTemplate,
                          AiQueryRepository aiQueryRepository,
                          UserRepository userRepository,
                          PortfolioRepository portfolioRepository,
                          HoldingRepository holdingRepository) {
        this.restTemplate = restTemplate;
        this.aiQueryRepository = aiQueryRepository;
        this.userRepository = userRepository;
        this.portfolioRepository = portfolioRepository;
        this.holdingRepository = holdingRepository;
    }

    @Override
    public Object analyzeStock(String ticker, String email) {
        User user = findUserByEmail(email);
        String upperTicker = ticker.toUpperCase();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("ticker", upperTicker);

        String responseBody = null;
        Object result = null;

        try {
            HttpHeaders headers = buildJsonHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    aiServiceBaseUrl + "/analysis/stock",
                    HttpMethod.POST,
                    entity,
                    Object.class
            );
            result = response.getBody();
            responseBody = serializeToJson(result);
        } catch (RestClientException e) {
            log.error("Error calling AI service for stock analysis of {}: {}", upperTicker, e.getMessage());
            result = Map.of("error", "AI service unavailable. Please try again later.", "ticker", upperTicker);
            responseBody = "Error: " + e.getMessage();
        }

        saveQuery(user, "Analyze stock: " + upperTicker, responseBody, "STOCK_ANALYSIS", upperTicker);
        return result;
    }

    @Override
    public Object chatWithAi(AiChatRequest request, String email) {
        User user = findUserByEmail(email);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", request.getMessage());
        if (request.getHistory() != null) {
            requestBody.put("history", request.getHistory());
        }
        if (request.getTicker() != null) {
            requestBody.put("ticker", request.getTicker().toUpperCase());
        }

        String responseBody = null;
        Object result = null;

        try {
            HttpHeaders headers = buildJsonHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    aiServiceBaseUrl + "/chat",
                    HttpMethod.POST,
                    entity,
                    Object.class
            );
            result = response.getBody();
            responseBody = serializeToJson(result);
        } catch (RestClientException e) {
            log.error("Error calling AI chat service: {}", e.getMessage());
            result = Map.of("error", "AI service unavailable. Please try again later.");
            responseBody = "Error: " + e.getMessage();
        }

        saveQuery(user, request.getMessage(), responseBody, "CHAT", request.getTicker());
        return result;
    }

    @Override
    public Object getPortfolioAnalysis(UUID portfolioId, String email) {
        User user = findUserByEmail(email);
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found with id: " + portfolioId));

        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolioId);
        List<Map<String, Object>> holdingData = holdings.stream().map(h -> {
            Map<String, Object> map = new HashMap<>();
            map.put("ticker", h.getTicker());
            map.put("companyName", h.getCompanyName());
            map.put("shares", h.getShares());
            map.put("averageCost", h.getAverageCost());
            map.put("totalCost", h.getShares().multiply(h.getAverageCost()));
            map.put("sector", h.getSector());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("portfolio_name", portfolio.getName());
        requestBody.put("currency", portfolio.getCurrency());
        requestBody.put("holdings", holdingData);

        String responseBody = null;
        Object result = null;

        try {
            HttpHeaders headers = buildJsonHeaders();
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    aiServiceBaseUrl + "/analysis/portfolio",
                    HttpMethod.POST,
                    entity,
                    Object.class
            );
            result = response.getBody();
            responseBody = serializeToJson(result);
        } catch (RestClientException e) {
            log.error("Error calling AI service for portfolio analysis: {}", e.getMessage());
            result = Map.of("error", "AI service unavailable. Please try again later.");
            responseBody = "Error: " + e.getMessage();
        }

        saveQuery(user, "Portfolio analysis: " + portfolio.getName(), responseBody, "PORTFOLIO", null);
        return result;
    }

    @Override
    public Object getHealth() {
        try {
            HttpHeaders headers = buildJsonHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Object> response = restTemplate.exchange(
                    aiServiceBaseUrl + "/health/gemini",
                    HttpMethod.GET,
                    entity,
                    Object.class
            );
            return response.getBody();
        } catch (RestClientException e) {
            log.error("Error calling AI service for health check: {}", e.getMessage());
            return Map.of("error", "AI service unavailable", "details", e.getMessage());
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private HttpHeaders buildJsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String groqKey = request.getHeader("X-Groq-Api-Key");
                String geminiKey = request.getHeader("X-Gemini-Api-Key");
                if (groqKey != null) headers.set("X-Groq-Api-Key", groqKey);
                if (geminiKey != null) headers.set("X-Gemini-Api-Key", geminiKey);
            }
        } catch (Exception e) {
            log.warn("Could not extract custom headers", e);
        }
        return headers;
    }

    private void saveQuery(User user, String query, String response, String queryType, String ticker) {
        try {
            AiQuery aiQuery = AiQuery.builder()
                    .user(user)
                    .query(query)
                    .response(response)
                    .queryType(queryType)
                    .ticker(ticker)
                    .build();
            aiQueryRepository.save(aiQuery);
        } catch (Exception e) {
            log.warn("Failed to persist AI query to database: {}", e.getMessage());
        }
    }

    private String serializeToJson(Object obj) {
        try {
            return new ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return obj != null ? obj.toString() : null;
        }
    }
}
