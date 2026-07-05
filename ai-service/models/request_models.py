"""Pydantic request models for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

from utils.validators import sanitize_ticker, validate_ticker, validate_period


class StockAnalysisRequest(BaseModel):
    """Request body for the full stock analysis endpoint."""

    ticker: str = Field(..., description="Stock ticker symbol, e.g. AAPL")
    include_ratios: bool = Field(True, description="Include financial ratio analysis")
    include_sentiment: bool = Field(True, description="Include AI-powered news sentiment")
    include_recommendation: bool = Field(True, description="Include BUY/HOLD/SELL recommendation")

    @field_validator("ticker")
    @classmethod
    def validate_and_sanitize_ticker(cls, v: str) -> str:
        clean = sanitize_ticker(v)
        if not validate_ticker(clean):
            raise ValueError(f"'{v}' is not a valid ticker symbol.")
        return clean


class ChatRequest(BaseModel):
    """Request body for the conversational chat endpoint."""

    message: str = Field(..., min_length=1, description="User's message to FinBot")
    history: list[dict] = Field(
        default_factory=list,
        description="Conversation history — list of {role, parts} dicts",
    )
    context: str | None = Field(
        None,
        description="Optional stock ticker to provide as extra context (e.g. 'TSLA')",
    )

    @field_validator("context")
    @classmethod
    def sanitize_context_ticker(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return sanitize_ticker(v)


class PortfolioHolding(BaseModel):
    """A single holding inside a portfolio analysis request."""

    ticker: str = Field(..., description="Ticker symbol")
    shares: float = Field(..., gt=0, description="Number of shares held")
    avg_cost: float = Field(..., gt=0, description="Average cost per share (purchase price)")

    @field_validator("ticker")
    @classmethod
    def validate_ticker_field(cls, v: str) -> str:
        clean = sanitize_ticker(v)
        if not validate_ticker(clean):
            raise ValueError(f"'{v}' is not a valid ticker symbol.")
        return clean


class PortfolioAnalysisRequest(BaseModel):
    """Request body for portfolio-level analysis."""

    holdings: list[PortfolioHolding] = Field(
        ..., min_length=1, description="List of portfolio holdings"
    )


class RiskRequest(BaseModel):
    """Request body for the risk analysis endpoint."""

    ticker: str = Field(..., description="Stock ticker symbol")
    period: str = Field("1y", description="Historical period for volatility calculation")

    @field_validator("ticker")
    @classmethod
    def validate_ticker_field(cls, v: str) -> str:
        clean = sanitize_ticker(v)
        if not validate_ticker(clean):
            raise ValueError(f"'{v}' is not a valid ticker symbol.")
        return clean

    @field_validator("period")
    @classmethod
    def validate_period_field(cls, v: str) -> str:
        if not validate_period(v):
            raise ValueError(
                f"'{v}' is not a valid period. "
                "Valid options: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max"
            )
        return v
