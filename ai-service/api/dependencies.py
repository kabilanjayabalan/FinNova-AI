"""FastAPI dependency providers — all services are singletons via lru_cache."""

from __future__ import annotations

from functools import lru_cache
from fastapi import Request, Depends as fastapi_Depends

from services.financial_data_service import FinancialDataService
from services.gemini_service import GeminiService
from services.news_service import NewsService
from services.ratio_analyzer import RatioAnalyzer
from services.recommendation_engine import RecommendationEngine
from services.risk_analyzer import RiskAnalyzer
from services.sentiment_service import SentimentService


@lru_cache(maxsize=1)
def get_financial_service() -> FinancialDataService:
    """Return the singleton FinancialDataService instance."""
    return FinancialDataService()


def get_gemini_service(request: Request) -> GeminiService:
    """Return a per-request GeminiService instance with optional API key override."""
    gemini_key = request.headers.get("x-gemini-api-key")
    return GeminiService(api_key_override=gemini_key)


@lru_cache(maxsize=1)
def get_ratio_analyzer() -> RatioAnalyzer:
    """Return the singleton RatioAnalyzer instance."""
    return RatioAnalyzer()


@lru_cache(maxsize=1)
def get_risk_analyzer() -> RiskAnalyzer:
    """Return the singleton RiskAnalyzer instance."""
    return RiskAnalyzer()


def get_sentiment_service(
    request: Request,
    financial: FinancialDataService = fastapi_Depends(get_financial_service)
) -> SentimentService:
    """Return a per-request SentimentService (depends on Gemini + Financial)."""
    return SentimentService(
        gemini_service=get_gemini_service(request),
        financial_data_service=financial,
    )


@lru_cache(maxsize=1)
def get_recommendation_engine() -> RecommendationEngine:
    """Return the singleton RecommendationEngine instance."""
    return RecommendationEngine()


@lru_cache(maxsize=1)
def get_news_service() -> NewsService:
    """Return the singleton NewsService instance."""
    return NewsService(financial_data_service=get_financial_service())
