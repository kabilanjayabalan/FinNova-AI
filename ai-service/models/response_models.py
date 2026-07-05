"""Pydantic response models for all API endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class FinancialRatios(BaseModel):
    """Key financial ratios extracted from yfinance info."""

    pe_ratio: float | None = Field(None, description="Trailing Price-to-Earnings ratio")
    pb_ratio: float | None = Field(None, description="Price-to-Book ratio")
    eps: float | None = Field(None, description="Trailing Earnings Per Share")
    debt_to_equity: float | None = Field(None, description="Debt-to-Equity ratio")
    roe: float | None = Field(None, description="Return on Equity (decimal, e.g. 0.15 = 15%)")
    current_ratio: float | None = Field(None, description="Current ratio (liquidity)")
    dividend_yield: float | None = Field(None, description="Dividend yield (decimal)")
    revenue_growth: float | None = Field(None, description="Year-over-year revenue growth (decimal)")


class RiskMetrics(BaseModel):
    """Quantitative risk metrics calculated from price history."""

    beta: float | None = Field(None, description="Market beta (sensitivity vs S&P 500)")
    volatility: float | None = Field(None, description="Annualised daily return volatility")
    sharpe_ratio: float | None = Field(None, description="Sharpe ratio (risk-adjusted return)")
    var_95: float | None = Field(None, description="Value at Risk at 95% confidence (daily)")
    max_drawdown: float | None = Field(None, description="Maximum peak-to-trough drawdown")
    risk_level: str = Field("UNKNOWN", description="LOW | MEDIUM | HIGH | VERY_HIGH")


class StockSummary(BaseModel):
    """High-level snapshot of a stock's current state."""

    ticker: str
    name: str = ""
    current_price: float | None = None
    change: float | None = None
    change_percent: float | None = None
    market_cap: float | None = None
    volume: int | None = None
    sector: str | None = None
    industry: str | None = None
    fifty_two_week_high: float | None = None
    fifty_two_week_low: float | None = None


class SentimentResult(BaseModel):
    """AI-generated sentiment result for a stock based on recent news."""

    ticker: str
    sentiment: str = Field("NEUTRAL", description="BULLISH | BEARISH | NEUTRAL")
    score: float = Field(0.0, ge=-1.0, le=1.0, description="Sentiment score from -1 to +1")
    confidence: float = Field(0.5, ge=0.0, le=1.0, description="Confidence in the assessment")
    summary: str = ""
    key_factors: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Top-level response models
# ---------------------------------------------------------------------------

class StockAnalysisResponse(BaseModel):
    """Full analysis response for a single stock."""

    ticker: str
    summary: StockSummary
    ratios: FinancialRatios | None = None
    risk: RiskMetrics | None = None
    sentiment: SentimentResult | None = None
    ai_analysis: str = ""
    recommendation: str = Field("HOLD", description="BUY | HOLD | SELL")
    recommendation_confidence: float = Field(0.5, ge=0.0, le=1.0)
    key_highlights: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    generated_at: str = ""


class ChatResponse(BaseModel):
    """Response from the FinBot conversational assistant."""

    message: str
    sources: list[str] = Field(default_factory=list)


class PortfolioHoldingAnalysis(BaseModel):
    """Per-holding analysis within a portfolio response."""

    ticker: str
    name: str = ""
    shares: float
    avg_cost: float
    current_price: float | None = None
    current_value: float | None = None
    gain_loss: float | None = None
    gain_loss_pct: float | None = None
    sector: str | None = None
    weight: float | None = None  # Portfolio weight 0–1


class PortfolioAnalysisResponse(BaseModel):
    """Full portfolio analysis response."""

    total_value: float
    total_gain_loss: float
    total_gain_loss_pct: float
    holdings_analysis: list[dict]
    sector_allocation: dict[str, float]
    ai_insights: str = ""
    diversification_score: float = Field(0.0, ge=0.0, le=1.0)
    overall_risk: str = "MEDIUM"
    recommendations: list[str] = Field(default_factory=list)


class NewsItemResponse(BaseModel):
    """A single news article for API responses."""

    title: str
    link: str = ""
    publisher: str = ""
    published: str = ""
    summary: str = ""


class ResearchReportResponse(BaseModel):
    """Full research report combining analysis, news, and AI narrative."""

    ticker: str
    name: str = ""
    generated_at: str = ""
    executive_summary: str = ""
    analysis: StockAnalysisResponse
    recent_news: list[NewsItemResponse] = Field(default_factory=list)
    full_report: str = ""


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str
    version: str
    gemini_available: bool = False
    details: dict = Field(default_factory=dict)
