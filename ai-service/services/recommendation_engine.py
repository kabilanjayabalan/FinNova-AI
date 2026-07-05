"""Score-based recommendation engine that combines ratio, risk and sentiment
signals into a BUY / HOLD / SELL recommendation with a confidence value.
"""

from __future__ import annotations

from models.response_models import FinancialRatios, RiskMetrics, SentimentResult
from utils.logger import get_logger

logger = get_logger(__name__)


class RecommendationEngine:
    """Generates a BUY / HOLD / SELL recommendation from quantitative signals."""

    def generate_recommendation(
        self,
        ratios: FinancialRatios | None,
        risk: RiskMetrics | None,
        sentiment: SentimentResult | None,
    ) -> tuple[str, float]:
        """Return ``(recommendation, confidence)`` based on a scoring model.

        Scoring logic
        -------------
        Valuation (PE ratio):
            PE < 15   → +1.5
            PE < 20   → +1.0
            PE < 30   → +0.5
            PE 30-40  →  0
            PE > 40   → -1.0
            PE > 60   → -1.5

        Profitability (ROE):
            ROE > 0.20 → +0.5
            ROE > 0    → +0.25
            ROE <= 0   → -0.5

        Sentiment:
            BULLISH    → +1.0 (scaled by confidence)
            NEUTRAL    →  0
            BEARISH    → -1.0 (scaled by confidence)

        Risk level:
            LOW        → +0.5
            MEDIUM     →  0
            HIGH       → -0.5
            VERY_HIGH  → -1.0

        Thresholds:
            score > 1.5  → BUY
            score < -1.0 → SELL
            otherwise    → HOLD

        Confidence is normalised from raw score to the [0.50, 0.95] range.
        """
        score = 0.0

        # --- Valuation signal ---
        if ratios and ratios.pe_ratio is not None:
            pe = ratios.pe_ratio
            if pe < 15:
                score += 1.5
            elif pe < 20:
                score += 1.0
            elif pe < 30:
                score += 0.5
            elif pe > 60:
                score -= 1.5
            elif pe > 40:
                score -= 1.0

        # --- Profitability signal ---
        if ratios and ratios.roe is not None:
            if ratios.roe > 0.20:
                score += 0.5
            elif ratios.roe > 0:
                score += 0.25
            else:
                score -= 0.5

        # --- Dividend yield bonus ---
        if ratios and ratios.dividend_yield and ratios.dividend_yield > 0.02:
            score += 0.25

        # --- Leverage penalty ---
        if ratios and ratios.debt_to_equity is not None:
            if ratios.debt_to_equity > 200:
                score -= 0.5
            elif ratios.debt_to_equity > 100:
                score -= 0.25

        # --- Sentiment signal ---
        if sentiment:
            confidence_weight = max(0.3, sentiment.confidence)
            if sentiment.sentiment == "BULLISH":
                score += 1.0 * confidence_weight
            elif sentiment.sentiment == "BEARISH":
                score -= 1.0 * confidence_weight

        # --- Risk signal ---
        if risk:
            level = risk.risk_level
            if level == "LOW":
                score += 0.5
            elif level == "MEDIUM":
                score += 0.0
            elif level == "HIGH":
                score -= 0.5
            elif level == "VERY_HIGH":
                score -= 1.0

        # --- Derive recommendation ---
        if score > 1.5:
            recommendation = "BUY"
        elif score < -1.0:
            recommendation = "SELL"
        else:
            recommendation = "HOLD"

        # --- Normalise confidence to [0.50, 0.95] ---
        # Max achievable score ≈ 4.25, min ≈ -4.25
        abs_score = abs(score)
        normalised = min(abs_score / 4.0, 1.0)  # 0–1
        confidence = round(0.50 + normalised * 0.45, 2)  # 0.50–0.95

        logger.debug(
            "Recommendation for score=%.2f → %s (confidence=%.2f)",
            score,
            recommendation,
            confidence,
        )
        return recommendation, confidence
