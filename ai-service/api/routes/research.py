"""Research routes — news, market news, and full research report generation."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from api.dependencies import (
    get_financial_service,
    get_gemini_service,
    get_news_service,
    get_ratio_analyzer,
    get_recommendation_engine,
    get_risk_analyzer,
    get_sentiment_service,
)
from models.request_models import StockAnalysisRequest
from models.response_models import (
    NewsItemResponse,
    ResearchReportResponse,
    StockAnalysisResponse,
    StockSummary,
)
from services.financial_data_service import FinancialDataService
from services.gemini_service import GeminiService
from services.news_service import NewsService
from services.ratio_analyzer import RatioAnalyzer
from services.recommendation_engine import RecommendationEngine
from services.risk_analyzer import RiskAnalyzer
from services.sentiment_service import SentimentService
from utils.logger import get_logger
from utils.validators import sanitize_ticker, validate_ticker

logger = get_logger(__name__)

router = APIRouter()


def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# GET /research/news/{ticker}
# ---------------------------------------------------------------------------

@router.get("/news/{ticker}", summary="Ticker-specific news")
async def get_ticker_news(
    ticker: str,
    news_svc: NewsService = Depends(get_news_service),
) -> dict:
    """Return recent news articles for a specific stock ticker."""
    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")

    items = await news_svc.get_ticker_news(ticker)
    return {
        "ticker": ticker,
        "count": len(items),
        "news": [
            NewsItemResponse(
                title=n.title,
                link=n.link,
                publisher=n.publisher,
                published=n.published,
                summary=n.summary,
            ).model_dump()
            for n in items
        ],
        "retrieved_at": _now_iso(),
    }


# ---------------------------------------------------------------------------
# GET /research/market-news
# ---------------------------------------------------------------------------

@router.get("/market-news", summary="General market news")
async def get_market_news(
    news_svc: NewsService = Depends(get_news_service),
) -> dict:
    """Return aggregated news across major market indices (SPY, QQQ, ^GSPC, etc.)."""
    items = await news_svc.get_market_news()
    return {
        "count": len(items),
        "news": [
            NewsItemResponse(
                title=n.title,
                link=n.link,
                publisher=n.publisher,
                published=n.published,
                summary=n.summary,
            ).model_dump()
            for n in items
        ],
        "retrieved_at": _now_iso(),
    }


# ---------------------------------------------------------------------------
# GET /research/analyze/{ticker} - Structured Groq Analysis
# ---------------------------------------------------------------------------

@router.get("/analyze/{ticker}", summary="Structured AI Analysis")
async def get_structured_analysis(
    ticker: str,
    request: Request,
    financial: FinancialDataService = Depends(get_financial_service),
) -> dict:
    from services.groq_service import groq_service
    import json

    ticker = sanitize_ticker(ticker)
    if not validate_ticker(ticker):
        raise HTTPException(status_code=400, detail=f"Invalid ticker: {ticker}")

    stock_data = await financial.get_stock_data(ticker)
    info = stock_data.info
    
    if not info.get("current_price"):
        raise HTTPException(status_code=404, detail=f"No financial data found for ticker '{ticker}'. The data provider might be rate-limiting requests or the ticker is invalid.")

    current_price = info.get("current_price")
    company_name = info.get("name", ticker)
    price_change = info.get("change")
    price_change_pct = info.get("change_percent")
    
    # Format history for chart (last 90 days)
    hist_df = stock_data.history
    price_history = []
    volume_history = []
    
    if hist_df is not None and len(hist_df) > 0:
        # Take last 90 rows (trading days)
        recent = hist_df[-90:]
        for row in recent:
            date_str = row.get("date", "")
            price_history.append({"date": date_str, "close": row.get("close", 0), "volume": row.get("volume", 0)})
            volume_history.append({"date": date_str, "volume": row.get("volume", 0)})

    groq_api_key = request.headers.get("x-groq-api-key")
    
    prompt = f'''Analyze the stock {ticker} ({company_name}) with the following data:
- Current Price: ${current_price}
- Market Cap: {info.get("market_cap")}
- P/E Ratio: {info.get("pe_ratio")}
- 52-Week High: {info.get("fifty_two_week_high")}
- 52-Week Low: {info.get("fifty_two_week_low")}
- Revenue Growth: {info.get("revenue_growth")}%
- EPS: {info.get("eps")}

Provide a JSON response with EXACTLY this structure (no extra text, just JSON):
{{
  "summary": "3-4 sentence investment analysis",
  "recommendation": "BUY or HOLD or SELL",
  "confidence": 75,
  "highlights": ["bullet 1", "bullet 2", "bullet 3"],
  "risks": ["risk 1", "risk 2"],
  "metrics": {{
    "peRatio": "28.5x",
    "eps": "$6.42",
    "dividendYield": "0.54%",
    "beta": "1.24",
    "marketCap": "2.96T",
    "roe": "147%",
    "revenueGrowth": "+8.1%"
  }}
}}
'''
    
    groq_analysis = {}
    try:
        raw_json = await groq_service.analyze_stock_json(prompt, api_key_override=groq_api_key)
        if raw_json:
            groq_analysis = json.loads(raw_json)
    except Exception as e:
        logger.warning(f"Groq structured analysis failed: {e}")
        
    if not groq_analysis:
        groq_analysis = {
            "summary": "AI analysis unavailable.",
            "recommendation": "HOLD",
            "confidence": 50,
            "highlights": ["Data fetched successfully"],
            "risks": ["AI narrative unavailable"],
            "metrics": {
                "peRatio": info.get("pe_ratio"),
                "eps": info.get("eps"),
                "marketCap": info.get("market_cap")
            }
        }

    return {
        "ticker": ticker,
        "companyName": company_name,
        "price": current_price,
        "change": price_change,
        "changePct": price_change_pct,
        "priceHistory": price_history,
        "volumeHistory": volume_history,
        **groq_analysis
    }

# ---------------------------------------------------------------------------
# POST /research/report  — full research report
# ---------------------------------------------------------------------------

class _ReportRequest(StockAnalysisRequest):
    """Inherits StockAnalysisRequest — all fields enabled by default."""
    include_ratios: bool = True
    include_sentiment: bool = True
    include_recommendation: bool = True


@router.post("/report", summary="Full research report")
async def generate_research_report(
    request: _ReportRequest,
    financial: FinancialDataService = Depends(get_financial_service),
    gemini: GeminiService = Depends(get_gemini_service),
    ratio_analyzer: RatioAnalyzer = Depends(get_ratio_analyzer),
    risk_analyzer: RiskAnalyzer = Depends(get_risk_analyzer),
    sentiment_svc: SentimentService = Depends(get_sentiment_service),
    rec_engine: RecommendationEngine = Depends(get_recommendation_engine),
    news_svc: NewsService = Depends(get_news_service),
) -> dict:
    """Generate a comprehensive research report combining analysis, news, and AI narrative.

    This is the most data-rich endpoint — it calls all services and produces a
    full, report-style response suitable for display in a research panel.
    """
    import asyncio as _asyncio

    ticker = request.ticker

    # Fetch data concurrently
    stock_data, news_items = await _asyncio.gather(
        financial.get_stock_data(ticker),
        news_svc.get_ticker_news(ticker),
    )

    info = stock_data.info
    if not info.get("current_price") and not info.get("name"):
        raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'")

    summary = StockSummary(
        ticker=ticker,
        name=info.get("name", ticker),
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

    ratios = ratio_analyzer.calculate_ratios(info, stock_data.financials)
    risk = risk_analyzer.calculate_risk(stock_data.history, info)
    sentiment = await sentiment_svc.get_sentiment(ticker)
    recommendation, rec_confidence = rec_engine.generate_recommendation(ratios, risk, sentiment)

    # AI narrative analysis
    ai_analysis = ""
    full_report = ""
    executive_summary = ""

    if gemini.available:
        stock_context = {
            "ticker": ticker,
            "name": info.get("name", ticker),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "current_price": info.get("current_price"),
            "market_cap": info.get("market_cap"),
            "pe_ratio": info.get("pe_ratio"),
            "pb_ratio": info.get("pb_ratio"),
            "eps": info.get("eps"),
            "roe": info.get("roe"),
            "revenue_growth": info.get("revenue_growth"),
            "debt_to_equity": info.get("debt_to_equity"),
            "current_ratio": info.get("current_ratio"),
            "dividend_yield": info.get("dividend_yield"),
            "beta": info.get("beta"),
            "profit_margins": info.get("profit_margins"),
            "gross_margins": info.get("gross_margins"),
            "description": info.get("description", "")[:500],
            "risk_level": risk.risk_level if risk else "UNKNOWN",
            "volatility": risk.volatility if risk else None,
            "sentiment": sentiment.sentiment if sentiment else "NEUTRAL",
            "recommendation": recommendation,
            "recent_headlines": [n.title for n in news_items[:8]],
        }

        try:
            ai_analysis = await gemini.analyze_stock(stock_context)
        except Exception as exc:
            logger.warning("Report AI analysis failed: %s", exc)
            ai_analysis = f"AI analysis unavailable: {exc}"

        # Generate executive summary separately
        if ai_analysis and not ai_analysis.startswith("AI analysis unavailable"):
            exec_prompt = (
                f"Based on the following detailed analysis of {ticker}, write a concise "
                f"3-4 sentence executive summary suitable for a research report cover page. "
                f"Include the recommendation ({recommendation}) and one key risk. "
                f"Be direct and professional.\n\nAnalysis:\n{ai_analysis[:2000]}"
            )
            try:
                executive_summary = await gemini.chat(
                    message=exec_prompt,
                    history=[],
                    system_prompt="You are a senior equity research analyst. Be concise and professional.",
                )
            except Exception:
                executive_summary = ai_analysis[:300] + "..."

        full_report = ai_analysis
    else:
        ai_analysis = (
            "AI narrative analysis requires GOOGLE_API_KEY to be configured. "
            "All quantitative metrics are available above."
        )
        full_report = ai_analysis
        executive_summary = (
            f"{ticker} ({info.get('name', ticker)}) — {recommendation} "
            f"(confidence: {rec_confidence:.0%}). "
            f"Sector: {info.get('sector', 'N/A')}. "
            f"Risk level: {risk.risk_level if risk else 'N/A'}."
        )

    analysis_response = StockAnalysisResponse(
        ticker=ticker,
        summary=summary,
        ratios=ratios,
        risk=risk,
        sentiment=sentiment,
        ai_analysis=ai_analysis,
        recommendation=recommendation,
        recommendation_confidence=rec_confidence,
        key_highlights=[],
        risks=[],
        generated_at=_now_iso(),
    )

    news_responses = [
        NewsItemResponse(
            title=n.title,
            link=n.link,
            publisher=n.publisher,
            published=n.published,
            summary=n.summary,
        )
        for n in news_items[:10]
    ]

    return {
        "ticker": ticker,
        "name": info.get("name", ticker),
        "generated_at": _now_iso(),
        "executive_summary": executive_summary,
        "recommendation": recommendation,
        "recommendation_confidence": rec_confidence,
        "analysis": analysis_response.model_dump(),
        "recent_news": [n.model_dump() for n in news_responses],
        "full_report": full_report,
    }
