"""Sentiment service — coordinates news fetching and AI sentiment analysis."""

from __future__ import annotations

from models.response_models import SentimentResult
from services.financial_data_service import FinancialDataService
from services.gemini_service import GeminiService
from utils.logger import get_logger

logger = get_logger(__name__)


class SentimentService:
    """Orchestrates news retrieval and Gemini-powered sentiment scoring."""

    def __init__(
        self,
        gemini_service: GeminiService,
        financial_data_service: FinancialDataService,
    ) -> None:
        self.gemini = gemini_service
        self.financial_data = financial_data_service

    async def get_sentiment(self, ticker: str) -> SentimentResult:
        """Fetch recent news for *ticker* and return an AI sentiment result.

        Falls back gracefully to NEUTRAL when Gemini is unavailable or no
        news is found.
        """
        try:
            news_items = await self.financial_data.get_news(ticker)

            if not news_items:
                logger.info("No news found for %s — returning NEUTRAL sentiment", ticker)
                return SentimentResult(
                    ticker=ticker,
                    sentiment="NEUTRAL",
                    score=0.0,
                    confidence=0.2,
                    summary="No recent news articles were found for this ticker.",
                    key_factors=[],
                )

            headlines = [item.title for item in news_items if item.title]

            # If Gemini is not available, return a basic NEUTRAL result
            if not self.gemini.available:
                return SentimentResult(
                    ticker=ticker,
                    sentiment="NEUTRAL",
                    score=0.0,
                    confidence=0.0,
                    summary=(
                        "AI sentiment analysis is unavailable — "
                        "Google API key not configured."
                    ),
                    key_factors=headlines[:3],
                )

            sentiment_data = await self.gemini.analyze_sentiment(headlines, ticker)

            return SentimentResult(
                ticker=ticker,
                sentiment=sentiment_data.get("sentiment", "NEUTRAL"),
                score=float(sentiment_data.get("score", 0.0)),
                confidence=float(sentiment_data.get("confidence", 0.5)),
                summary=sentiment_data.get("summary", ""),
                key_factors=sentiment_data.get("key_factors", []),
            )

        except RuntimeError as exc:
            # Gemini not configured
            logger.warning("SentimentService: Gemini unavailable — %s", exc)
            return SentimentResult(
                ticker=ticker,
                sentiment="NEUTRAL",
                score=0.0,
                confidence=0.0,
                summary=str(exc),
                key_factors=[],
            )
        except Exception as exc:
            logger.error("SentimentService.get_sentiment failed for %s: %s", ticker, exc)
            return SentimentResult(
                ticker=ticker,
                sentiment="NEUTRAL",
                score=0.0,
                confidence=0.0,
                summary=f"Sentiment analysis failed: {exc}",
                key_factors=[],
            )
