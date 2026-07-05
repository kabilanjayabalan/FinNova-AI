"""News service — provides per-ticker and general market news."""

from __future__ import annotations

import asyncio
import xml.etree.ElementTree as ET
from datetime import timezone
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus

import httpx

from models.analysis_models import NewsItem
from services.financial_data_service import FinancialDataService, _strip_html
from utils.logger import get_logger

logger = get_logger(__name__)

# Google News RSS topic queries for broad market news (no API key required)
_MARKET_RSS_QUERIES = [
    "stock market",
    "S&P 500",
    "economy investing",
    "Wall Street",
]

_RSS_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}


class NewsService:
    """Retrieves news using FinancialDataService (for tickers) and
    Google News RSS (for broad market topics), with deduplication."""

    def __init__(self, financial_data_service: FinancialDataService) -> None:
        self.financial_data = financial_data_service

    async def get_ticker_news(self, ticker: str) -> list[NewsItem]:
        """Return recent news articles for a specific ticker via Google News RSS."""
        return await self.financial_data.get_news(ticker)

    async def get_market_news(self) -> list[NewsItem]:
        """Fetch broad market news from Google News RSS topic queries.

        Queries multiple market-related keywords concurrently and deduplicates
        on article title.  Returns up to 30 articles sorted newest-first.
        """
        tasks = [self._fetch_rss_topic(q) for q in _MARKET_RSS_QUERIES]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        seen_titles: set[str] = set()
        all_news: list[NewsItem] = []

        for result in results:
            if isinstance(result, Exception):
                logger.warning("Market RSS fetch failed: %s", result)
                continue
            for item in result:
                norm_title = item.title.lower().strip()
                if norm_title not in seen_titles:
                    seen_titles.add(norm_title)
                    all_news.append(item)

        # Sort by published date descending (ISO strings sort correctly)
        all_news.sort(key=lambda n: n.published, reverse=True)
        return all_news[:30]

    async def _fetch_rss_topic(self, query: str) -> list[NewsItem]:
        """Fetch one Google News RSS topic and return a list of NewsItem."""
        encoded = quote_plus(query)
        url = f"https://news.google.com/rss/search?q={encoded}&hl=en-US&gl=US&ceid=US:en"

        async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
            response = await client.get(url, headers=_RSS_HEADERS)
            response.raise_for_status()
            xml_text = response.text

        root = ET.fromstring(xml_text)
        channel = root.find("channel")
        if channel is None:
            return []

        items: list[NewsItem] = []
        for item_el in channel.findall("item")[:10]:
            try:
                title_el = item_el.find("title")
                link_el = item_el.find("link")
                pub_date_el = item_el.find("pubDate")
                desc_el = item_el.find("description")
                source_el = item_el.find("source")

                title = title_el.text.strip() if title_el is not None and title_el.text else "No title"
                link = link_el.text.strip() if link_el is not None and link_el.text else ""
                description = _strip_html(desc_el.text or "") if desc_el is not None else ""
                # Clear description when it's just a repeat of the title (Google News default)
                if description and title and description.lower().startswith(title[:40].lower()):
                    description = ""
                publisher = (
                    source_el.text.strip()
                    if source_el is not None and source_el.text
                    else ""
                )

                published = ""
                if pub_date_el is not None and pub_date_el.text:
                    try:
                        dt = parsedate_to_datetime(pub_date_el.text.strip())
                        published = dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                    except Exception:
                        published = pub_date_el.text.strip()

                # Strip " - Publisher" suffix Google News adds to titles
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
                logger.debug("Skipping malformed RSS market item: %s", exc)
                continue

        return items
