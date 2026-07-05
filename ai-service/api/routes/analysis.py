"""Analysis routes — stock, portfolio, risk, ratio, and sentiment endpoints."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from api.dependencies import (
    get_financial_service,
    get_gemini_service,
    get_ratio_analyzer,
    get_recommendation_engine,
    get_risk_analyzer,
    get_sentiment_service,
)
from models.request_models import PortfolioAnalysisRequest, StockAnalysisRequest
from models.response_models import (
    FinancialRatios,
    PortfolioAnalysisResponse,
    RiskMetrics,
    SentimentResult,
    StockAnalysisResponse,
    StockSummary,
)
from services.financial_data_service import FinancialDataService
from services.gemini_service import GeminiService
from services.ratio_analyzer import RatioAnalyzer
from services.recommendation_engine import RecommendationEngine
from services.risk_analyzer import RiskAnalyzer
from services.sentiment_service import SentimentService
from utils.formatters import format_currency, format_large_number, format_market_cap, format_percentage
from utils.logger import get_logger
from utils.validators import sanitize_ticker, validate_ticker, validate_period

logger = get_logger(__name__)

router = APIRouter()


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _build_stock_summary(ticker: str, info: dict) -> StockSummary:
    return StockSummary(
        ticker=ticker,
        name=info.get("name") or ticker,
        current_price=info.get("current_price"),
        change=info.get("change"),
        change_percent=info.get("change_percent"),
        market_cap=info.get("market_cap"),
        volume=info.get("volume"),
        sector=info.get("sector"),
        industry=info.get("industry"),
        fifty_two_week_high=info.get("fifty_two_week_high"),
        fifty_two_week_low=info.get("fifty_two_week_low"),
    )


def _build_key_highlights(info: dict, ratios: FinancialRatios | None) -> list[str]:
    highlights: list[str] = []
    if info.get("current_price") and info.get("fifty_two_week_high"):
        pct_from_high = (
            (info["current_price"] - info["fifty_two_week_high"])
            / info["fifty_two_week_high"]
        ) * 100
        highlights.append(
            f"Trading {abs(pct_from_high):.1f}% {'below' if pct_from_high < 0 else 'above'} its 52-week high"
        )
    if info.get("market_cap"):
        highlights.append(f"Market cap: {format_market_cap(info['market_cap'])}")
    if ratios:
        if ratios.pe_ratio is not None:
            highlights.append(f"PE ratio: {ratios.pe_ratio:.1f}x")
        if ratios.dividend_yield and ratios.dividend_yield > 0:
            highlights.append(f"Dividend yield: {format_percentage(ratios.dividend_yield)}")
        if ratios.roe is not None:
            highlights.append(f"Return on equity: {format_percentage(ratios.roe)}")
    if info.get("revenue_growth"):
        highlights.append(f"Revenue growth (YoY): {format_percentage(info['revenue_growth'])}")
    return highlights[:6]


def _build_risks(info: dict, ratios: FinancialRatios | None, risk: RiskMetrics | None) -> list[str]:
    risks: list[str] = []
    if risk:
        if risk.risk_level in ("HIGH", "VERY_HIGH"):
            risks.append(f"High price volatility ({risk.risk_level.replace('_', ' ')} risk tier)")
        if risk.beta is not None and risk.beta > 1.5:
            risks.append(f"High market sensitivity (beta: {risk.beta:.2f})")
        if risk.max_drawdown is not None and risk.max_drawdown < -0.30:
            risks.append(f"Significant historical drawdown ({risk.max_drawdown * 100:.1f}%)")
    if ratios:
        if ratios.debt_to_equity is not None and ratios.debt_to_equity > 150:
            risks.append(f"High leverage (D/E ratio: {ratios.debt_to_equity:.0f}%)")
        if ratios.current_ratio is not None and ratios.current_ratio < 1.0:
            risks.append(f"Liquidity concern (current ratio: {ratios.current_ratio:.2f})")
    return risks[:5]


# ---------------------------------------------------------------------------
# GET /analysis/stock/{ticker}  — quick summary
# ---------------------------------------------------------------------------

@router.get("/stock/{ticker}", summary="Quick stock summary")
async def get_stock_summary(
    ticker: str,
    financial: FinancialDataService = Depends(get_financial_service),
) -> dict:
    """Return a lightweight price/info snapshot for a ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")

    info = await financial.get_stock_info(ticker)
    if not info.get("current_price") and not info.get("name"):
        raise HTTPException(
            status_code=404, detail=f"No data found for ticker '{ticker}'"
        )

    return {
        "ticker": ticker,
        "name": info.get("name", ticker),
        "current_price": info.get("current_price"),
        "change": info.get("change"),
        "change_percent": info.get("change_percent"),
        "market_cap": info.get("market_cap"),
        "market_cap_formatted": format_market_cap(info.get("market_cap")),
        "volume": info.get("volume"),
        "sector": info.get("sector"),
        "industry": info.get("industry"),
        "fifty_two_week_high": info.get("fifty_two_week_high"),
        "fifty_two_week_low": info.get("fifty_two_week_low"),
        "currency": info.get("currency", "USD"),
        "retrieved_at": _now_iso(),
    }


# ---------------------------------------------------------------------------
# POST /analysis/stock  — full analysis
# ---------------------------------------------------------------------------

@router.post("/stock", response_model=StockAnalysisResponse, summary="Full stock analysis")
async def full_stock_analysis(
    request: StockAnalysisRequest,
    financial: FinancialDataService = Depends(get_financial_service),
    gemini: GeminiService = Depends(get_gemini_service),
    ratio_analyzer: RatioAnalyzer = Depends(get_ratio_analyzer),
    risk_analyzer: RiskAnalyzer = Depends(get_risk_analyzer),
    sentiment_svc: SentimentService = Depends(get_sentiment_service),
    rec_engine: RecommendationEngine = Depends(get_recommendation_engine),
) -> StockAnalysisResponse:
    """Perform a comprehensive AI-powered analysis of a stock."""
    ticker = request.ticker

    # Fetch all raw data concurrently
    stock_data = await financial.get_stock_data(ticker)
    info = stock_data.info

    if not info.get("current_price") and not info.get("name"):
        raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'")

    summary = _build_stock_summary(ticker, info)

    # Ratios
    ratios: FinancialRatios | None = None
    if request.include_ratios:
        ratios = ratio_analyzer.calculate_ratios(info, stock_data.financials)

    # Risk
    risk: RiskMetrics | None = None
    risk = risk_analyzer.calculate_risk(stock_data.history, info)

    # Sentiment
    sentiment: SentimentResult | None = None
    if request.include_sentiment:
        sentiment = await sentiment_svc.get_sentiment(ticker)

    # Recommendation
    recommendation = "HOLD"
    recommendation_confidence = 0.5
    if request.include_recommendation:
        recommendation, recommendation_confidence = rec_engine.generate_recommendation(
            ratios, risk, sentiment
        )

    # AI narrative
    ai_analysis = ""
    if gemini.available:
        stock_data_for_ai = {
            "ticker": ticker,
            "info": {k: v for k, v in info.items() if v is not None},
            "recent_news_titles": [n.title for n in stock_data.news[:5]],
        }
        try:
            ai_analysis = await gemini.analyze_stock(stock_data_for_ai)
        except Exception as exc:
            logger.warning("AI analysis failed for %s: %s", ticker, exc)
            ai_analysis = f"AI analysis unavailable: {exc}"
    else:
        ai_analysis = (
            "AI analysis requires a configured GOOGLE_API_KEY. "
            "Financial metrics are still available above."
        )

    key_highlights = _build_key_highlights(info, ratios)
    risks_list = _build_risks(info, ratios, risk)

    return StockAnalysisResponse(
        ticker=ticker,
        summary=summary,
        ratios=ratios,
        risk=risk,
        sentiment=sentiment,
        ai_analysis=ai_analysis,
        recommendation=recommendation,
        recommendation_confidence=recommendation_confidence,
        key_highlights=key_highlights,
        risks=risks_list,
        generated_at=_now_iso(),
    )


# ---------------------------------------------------------------------------
# GET /analysis/ratios/{ticker}
# ---------------------------------------------------------------------------

@router.get("/ratios/{ticker}", response_model=FinancialRatios, summary="Financial ratios")
async def get_ratios(
    ticker: str,
    financial: FinancialDataService = Depends(get_financial_service),
    ratio_analyzer: RatioAnalyzer = Depends(get_ratio_analyzer),
) -> FinancialRatios:
    """Return key financial ratios for a ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")

    info = await financial.get_stock_info(ticker)
    financials = await financial.get_financials(ticker)
    return ratio_analyzer.calculate_ratios(info, financials)


# ---------------------------------------------------------------------------
# GET /analysis/sentiment/{ticker}
# ---------------------------------------------------------------------------

@router.get("/sentiment/{ticker}", response_model=SentimentResult, summary="News sentiment")
async def get_sentiment(
    ticker: str,
    sentiment_svc: SentimentService = Depends(get_sentiment_service),
) -> SentimentResult:
    """Return AI-powered news sentiment for a ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")
    return await sentiment_svc.get_sentiment(ticker)


# ---------------------------------------------------------------------------
# GET /analysis/risk/{ticker}
# ---------------------------------------------------------------------------

@router.get("/risk/{ticker}", response_model=RiskMetrics, summary="Risk metrics")
async def get_risk(
    ticker: str,
    period: str = Query("1y", description="Historical period for volatility"),
    financial: FinancialDataService = Depends(get_financial_service),
    risk_analyzer: RiskAnalyzer = Depends(get_risk_analyzer),
) -> RiskMetrics:
    """Return quantitative risk metrics for a ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")
    if not validate_period(period):
        raise HTTPException(status_code=400, detail=f"Invalid period: {period}")

    info, history = await __import__("asyncio").gather(
        financial.get_stock_info(ticker),
        financial.get_historical_prices(ticker, period),
    )
    return risk_analyzer.calculate_risk(history, info)


# ---------------------------------------------------------------------------
# GET /analysis/history/{ticker}
# ---------------------------------------------------------------------------

@router.get("/history/{ticker}", summary="Historical price data")
async def get_history(
    ticker: str,
    period: str = Query("1y", description="yfinance period string"),
    financial: FinancialDataService = Depends(get_financial_service),
) -> dict:
    """Return OHLCV historical prices for a ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")
    if not validate_period(period):
        raise HTTPException(status_code=400, detail=f"Invalid period: {period}")

    history = await financial.get_historical_prices(ticker, period)
    return {
        "ticker": ticker,
        "period": period,
        "count": len(history),
        "data": history,
    }


# ---------------------------------------------------------------------------
# POST /analysis/portfolio
# ---------------------------------------------------------------------------

@router.post("/portfolio", response_model=PortfolioAnalysisResponse, summary="Portfolio analysis")
async def analyze_portfolio(
    request: PortfolioAnalysisRequest,
    financial: FinancialDataService = Depends(get_financial_service),
    gemini: GeminiService = Depends(get_gemini_service),
    ratio_analyzer: RatioAnalyzer = Depends(get_ratio_analyzer),
    risk_analyzer: RiskAnalyzer = Depends(get_risk_analyzer),
) -> PortfolioAnalysisResponse:
    """Analyse a multi-stock portfolio and return AI-powered insights."""
    import asyncio as _asyncio

    holdings = request.holdings
    tickers = [h.ticker for h in holdings]

    # Fetch info for all holdings concurrently
    info_results = await _asyncio.gather(
        *[financial.get_stock_info(t) for t in tickers],
        return_exceptions=True,
    )

    holdings_analysis: list[dict] = []
    sector_counts: dict[str, float] = {}
    total_cost = 0.0
    total_value = 0.0

    for holding, info_result in zip(holdings, info_results):
        if isinstance(info_result, Exception):
            info_result = {}

        info: dict = info_result if isinstance(info_result, dict) else {}
        current_price = info.get("current_price")
        cost_basis = holding.shares * holding.avg_cost
        current_value = (current_price * holding.shares) if current_price else None
        gain_loss = (current_value - cost_basis) if current_value is not None else None
        gain_loss_pct = (gain_loss / cost_basis * 100) if (gain_loss is not None and cost_basis > 0) else None

        total_cost += cost_basis
        if current_value is not None:
            total_value += current_value

        sector = info.get("sector") or "Unknown"
        sector_counts[sector] = sector_counts.get(sector, 0.0) + (current_value or cost_basis)

        holdings_analysis.append({
            "ticker": holding.ticker,
            "name": info.get("name", holding.ticker),
            "shares": holding.shares,
            "avg_cost": holding.avg_cost,
            "current_price": current_price,
            "current_value": current_value,
            "cost_basis": cost_basis,
            "gain_loss": gain_loss,
            "gain_loss_pct": gain_loss_pct,
            "sector": sector,
            "currency": info.get("currency", "USD"),
        })

    # Use total_value (or total_cost if no prices available)
    portfolio_total = total_value if total_value > 0 else total_cost
    total_gain_loss = total_value - total_cost if total_value > 0 else 0.0
    total_gain_loss_pct = (total_gain_loss / total_cost * 100) if total_cost > 0 else 0.0

    # Compute portfolio weights and sector allocation percentages
    for h in holdings_analysis:
        h["weight"] = (
            (h["current_value"] or h["cost_basis"]) / portfolio_total * 100
            if portfolio_total > 0
            else 0.0
        )

    sector_allocation: dict[str, float] = {}
    if portfolio_total > 0:
        for sec, val in sector_counts.items():
            sector_allocation[sec] = round(val / portfolio_total * 100, 2)

    # Diversification score: 1.0 if many sectors, 0 if single sector
    n_sectors = len([k for k in sector_allocation if k != "Unknown"])
    n_holdings = len(holdings)
    diversification_score = min(1.0, (n_sectors / max(n_holdings, 1)) * 1.5)

    # Overall risk based on single-holding concentration
    max_weight = max((h.get("weight", 0) for h in holdings_analysis), default=0)
    if max_weight > 50:
        overall_risk = "HIGH"
    elif max_weight > 30:
        overall_risk = "MEDIUM-HIGH"
    else:
        overall_risk = "MEDIUM"

    # AI insights
    ai_insights = ""
    if gemini.available:
        ai_holdings_data = [
            {
                "ticker": h["ticker"],
                "name": h["name"],
                "weight_pct": round(h.get("weight", 0), 2),
                "gain_loss_pct": h["gain_loss_pct"],
                "sector": h["sector"],
                "current_value": h["current_value"],
            }
            for h in holdings_analysis
        ]
        portfolio_context = {
            "holdings": ai_holdings_data,
            "total_value": portfolio_total,
            "total_gain_loss_pct": total_gain_loss_pct,
            "sector_allocation": sector_allocation,
            "diversification_score": round(diversification_score, 2),
            "overall_risk": overall_risk,
        }
        try:
            ai_insights = await gemini.analyze_portfolio([portfolio_context])
        except Exception as exc:
            logger.warning("Portfolio AI analysis failed: %s", exc)
            ai_insights = f"AI insights unavailable: {exc}"
    else:
        ai_insights = "AI insights require a configured GOOGLE_API_KEY."

    # Simple recommendations
    recommendations: list[str] = []
    if diversification_score < 0.4:
        recommendations.append("Consider increasing diversification across more sectors.")
    if max_weight > 30:
        top = max(holdings_analysis, key=lambda h: h.get("weight", 0))
        recommendations.append(
            f"{top['ticker']} represents {top.get('weight', 0):.1f}% of your portfolio — consider trimming."
        )
    if total_gain_loss_pct < -10:
        recommendations.append(
            "Portfolio is down significantly. Review underperformers for potential tax-loss harvesting."
        )

    return PortfolioAnalysisResponse(
        total_value=round(portfolio_total, 2),
        total_gain_loss=round(total_gain_loss, 2),
        total_gain_loss_pct=round(total_gain_loss_pct, 2),
        holdings_analysis=holdings_analysis,
        sector_allocation=sector_allocation,
        ai_insights=ai_insights,
        diversification_score=round(diversification_score, 2),
        overall_risk=overall_risk,
        recommendations=recommendations,
    )
