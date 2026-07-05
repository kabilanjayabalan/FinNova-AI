"""Financial data service — wraps yfinance to fetch stock info, history and
financials, and Google News RSS for news — all without an API key.

Note: yfinance is a synchronous library.  All blocking calls are executed via
``asyncio.to_thread`` so they do not block the FastAPI event loop.
"""

from __future__ import annotations

import asyncio
import math
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from typing import Any
from urllib.parse import quote_plus

import httpx
import pandas as pd
import yfinance as yf

from models.analysis_models import NewsItem, StockData
from utils.logger import get_logger

logger = get_logger(__name__)


class _HTMLStripper(HTMLParser):
    """Minimal HTML-tag stripper using stdlib html.parser."""
    def __init__(self):
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)

    def get_text(self) -> str:
        return " ".join(self._parts).strip()


def _strip_html(raw: str) -> str:
    """Return plain text from an HTML string."""
    if not raw:
        return ""
    stripper = _HTMLStripper()
    try:
        stripper.feed(raw)
        return stripper.get_text()
    except Exception:
        return raw




def _safe_float(value: Any) -> float | None:
    """Convert a value to float, returning None if it's NaN / None / non-numeric."""
    if value is None:
        return None
    try:
        f = float(value)
        return None if math.isnan(f) or math.isinf(f) else f
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    """Convert a value to int, returning None if conversion fails."""
    f = _safe_float(value)
    return None if f is None else int(f)


class FinancialDataService:
    """Async facade over the yfinance library."""

    # ------------------------------------------------------------------
    # Public async methods
    # ------------------------------------------------------------------

    async def get_stock_info(self, ticker: str) -> dict:
        """Fetch high-level stock info and return a normalised dict."""
        try:
            info = await asyncio.to_thread(self._fetch_info, ticker)
            return self._normalise_info(ticker, info)
        except Exception as exc:
            logger.warning("get_stock_info failed for %s: %s", ticker, exc)
            return self._empty_info(ticker)

    async def get_historical_prices(
        self, ticker: str, period: str = "1y"
    ) -> list[dict]:
        """Return OHLCV history as a list of row dicts."""
        try:
            return await asyncio.to_thread(self._fetch_history, ticker, period)
        except Exception as exc:
            logger.warning("get_historical_prices failed for %s: %s", ticker, exc)
            return []

    async def get_financials(self, ticker: str) -> dict:
        """Fetch income statement and balance sheet data."""
        try:
            return await asyncio.to_thread(self._fetch_financials, ticker)
        except Exception as exc:
            logger.warning("get_financials failed for %s: %s", ticker, exc)
            return {}

    async def get_news(self, ticker: str) -> list[NewsItem]:
        """Fetch recent news articles for *ticker* via Google News RSS.

        This requires no API key — Google News RSS is freely accessible.
        Falls back to an empty list on any network or parse error.
        """
        try:
            return await self._fetch_news_rss(ticker)
        except Exception as exc:
            logger.warning("get_news (RSS) failed for %s: %s", ticker, exc)
            return []

    async def get_stock_data(self, ticker: str) -> StockData:
        """Aggregate all data sources into a single StockData object."""
        info_task = asyncio.create_task(self.get_stock_info(ticker))
        history_task = asyncio.create_task(self.get_historical_prices(ticker))
        financials_task = asyncio.create_task(self.get_financials(ticker))
        news_task = asyncio.create_task(self.get_news(ticker))

        info, history, financials, news = await asyncio.gather(
            info_task, history_task, financials_task, news_task
        )

        return StockData(
            ticker=ticker,
            info=info,
            history=history,
            financials=financials,
            news=news,
        )

    # ------------------------------------------------------------------
    # Private synchronous helpers (called via asyncio.to_thread)
    # ------------------------------------------------------------------

    def _fetch_info(self, ticker: str) -> dict:
        t = yf.Ticker(ticker)
        return t.info or {}

    def _normalise_info(self, ticker: str, info: dict) -> dict:
        """Map raw yfinance info keys to a clean, stable schema."""
        current_price = (
            _safe_float(info.get("currentPrice"))
            or _safe_float(info.get("regularMarketPrice"))
            or _safe_float(info.get("previousClose"))
        )
        prev_close = _safe_float(info.get("previousClose")) or _safe_float(
            info.get("regularMarketPreviousClose")
        )

        change: float | None = None
        change_pct: float | None = None
        if current_price is not None and prev_close is not None and prev_close != 0:
            change = current_price - prev_close
            change_pct = (change / prev_close) * 100

        return {
            "ticker": ticker,
            "name": info.get("longName") or info.get("shortName") or ticker,
            "current_price": current_price,
            "previous_close": prev_close,
            "change": _safe_float(change),
            "change_percent": _safe_float(change_pct),
            "market_cap": _safe_float(info.get("marketCap")),
            "volume": _safe_int(info.get("volume") or info.get("regularMarketVolume")),
            "avg_volume": _safe_int(info.get("averageVolume")),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "fifty_two_week_high": _safe_float(info.get("fiftyTwoWeekHigh")),
            "fifty_two_week_low": _safe_float(info.get("fiftyTwoWeekLow")),
            "pe_ratio": _safe_float(info.get("trailingPE")),
            "forward_pe": _safe_float(info.get("forwardPE")),
            "pb_ratio": _safe_float(info.get("priceToBook")),
            "eps": _safe_float(info.get("trailingEps")),
            "dividend_yield": _safe_float(info.get("dividendYield")),
            "beta": _safe_float(info.get("beta")),
            "debt_to_equity": _safe_float(info.get("debtToEquity")),
            "roe": _safe_float(info.get("returnOnEquity")),
            "current_ratio": _safe_float(info.get("currentRatio")),
            "revenue_growth": _safe_float(info.get("revenueGrowth")),
            "gross_margins": _safe_float(info.get("grossMargins")),
            "profit_margins": _safe_float(info.get("profitMargins")),
            "operating_margins": _safe_float(info.get("operatingMargins")),
            "free_cashflow": _safe_float(info.get("freeCashflow")),
            "total_revenue": _safe_float(info.get("totalRevenue")),
            "ebitda": _safe_float(info.get("ebitda")),
            "description": info.get("longBusinessSummary", ""),
            "website": info.get("website", ""),
            "country": info.get("country", ""),
            "employees": _safe_int(info.get("fullTimeEmployees")),
            "exchange": info.get("exchange", ""),
            "currency": info.get("currency", "USD"),
        }

    def _empty_info(self, ticker: str) -> dict:
        return {"ticker": ticker, "name": ticker, "current_price": None}

    def _fetch_history(self, ticker: str, period: str) -> list[dict]:
        t = yf.Ticker(ticker)
        df: pd.DataFrame = t.history(period=period)
        if df.empty:
            return []

        rows: list[dict] = []
        for ts, row in df.iterrows():
            date_str = (
                ts.strftime("%Y-%m-%d")
                if hasattr(ts, "strftime")
                else str(ts)
            )
            rows.append(
                {
                    "date": date_str,
                    "open": _safe_float(row.get("Open")),
                    "high": _safe_float(row.get("High")),
                    "low": _safe_float(row.get("Low")),
                    "close": _safe_float(row.get("Close")),
                    "volume": _safe_int(row.get("Volume")),
                }
            )
        return rows

    def _fetch_financials(self, ticker: str) -> dict:
        t = yf.Ticker(ticker)
        result: dict = {}

        def df_to_dict(df: pd.DataFrame | None) -> dict:
            if df is None or df.empty:
                return {}
            try:
                return {
                    str(col): {
                        str(idx): (None if pd.isna(val) else float(val))
                        for idx, val in df[col].items()
                    }
                    for col in df.columns
                }
            except Exception:
                return {}

        try:
            result["income_statement"] = df_to_dict(t.financials)
        except Exception:
            result["income_statement"] = {}

        try:
            result["balance_sheet"] = df_to_dict(t.balance_sheet)
        except Exception:
            result["balance_sheet"] = {}

        try:
            result["cash_flow"] = df_to_dict(t.cashflow)
        except Exception:
            result["cash_flow"] = {}

        return result

    async def _fetch_news_rss(self, ticker: str) -> list[NewsItem]:
        """Fetch up to 20 news articles from Google News RSS for *ticker*.

        The Google News RSS feed requires no API key and is always free.
        URL format: https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en
        """
        query = quote_plus(f"{ticker} stock")
        url = (
            f"https://news.google.com/rss/search"
            f"?q={query}&hl=en-US&gl=US&ceid=US:en"
        )

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0 Safari/537.36"
            )
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            xml_text = response.text

        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            logger.warning("Google News RSS: no <channel> found for %s", ticker)
            return []

        items: list[NewsItem] = []
        for item_el in channel.findall("item")[:20]:  # cap at 20
            try:
                title_el = item_el.find("title")
                link_el = item_el.find("link")
                pub_date_el = item_el.find("pubDate")
                desc_el = item_el.find("description")
                source_el = item_el.find("source")

                title = title_el.text.strip() if title_el is not None and title_el.text else "No title"
                link = link_el.text.strip() if link_el is not None and link_el.text else ""
                # Strip HTML tags from the description (Google News includes an <a> tag)
                description = _strip_html(desc_el.text or "") if desc_el is not None else ""
                # Google News <description> is usually just the title text inside an <a> tag.
                # Clear it so the UI doesn't show a redundant repeat of the headline.
                if description and title and description.lower().startswith(title[:40].lower()):
                    description = ""
                publisher = (
                    source_el.text.strip()
                    if source_el is not None and source_el.text
                    else ""
                )

                # Parse RFC 2822 date (e.g. "Sat, 05 Jul 2026 04:00:00 GMT")
                published = ""
                if pub_date_el is not None and pub_date_el.text:
                    try:
                        dt = parsedate_to_datetime(pub_date_el.text.strip())
                        published = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                    except Exception:
                        published = pub_date_el.text.strip()

                # Google News appends " - Publisher" to every title; split it off
                # when we don't already have the publisher from the <source> tag.
                if " - " in title and not publisher:
                    parts = title.rsplit(" - ", 1)
                    if len(parts) == 2:
                        title = parts[0].strip()
                        publisher = parts[1].strip()

                items.append(
                    NewsItem(
                        title=title,
                        link=link,
                        publisher=publisher or "Google News",
                        published=published,
                        summary=description,
                    )
                )
            except Exception as exc:
                logger.debug("Skipping malformed RSS item: %s", exc)
                continue

        logger.info("Google News RSS: fetched %d articles for %s", len(items), ticker)
        return items
