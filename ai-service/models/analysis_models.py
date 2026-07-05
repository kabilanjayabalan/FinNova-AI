"""Internal data models used within the service layer."""

from __future__ import annotations

from pydantic import BaseModel, Field


class NewsItem(BaseModel):
    """A single news article fetched from yfinance."""

    title: str
    link: str = ""
    publisher: str = ""
    published: str = ""
    summary: str = ""


class StockData(BaseModel):
    """Aggregated raw data for a single stock, populated by FinancialDataService."""

    ticker: str
    info: dict = Field(default_factory=dict)
    # OHLCV history serialised as a list of row dicts (date, open, high, low, close, volume)
    history: list[dict] = Field(default_factory=list)
    financials: dict = Field(default_factory=dict)
    news: list[NewsItem] = Field(default_factory=list)
