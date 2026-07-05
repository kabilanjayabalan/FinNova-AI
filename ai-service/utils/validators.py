"""Input validation and sanitisation helpers."""

from __future__ import annotations

import re

# Valid yfinance period strings
_VALID_PERIODS = frozenset(
    {"1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"}
)

# Ticker regex: 1-15 characters including A-Z, 0-9, -, =, ., ^
# Allows indices (^GSPC), commodities (GC=F), and crypto (BTC-USD).
_TICKER_RE = re.compile(r"^[A-Z0-9\-\=\.\^]{1,15}$")


def sanitize_ticker(ticker: str) -> str:
    """Return the ticker in a canonical upper-case, whitespace-stripped form.

    Examples:
        " aapl "  -> "AAPL"
        "brk.b"   -> "BRK.B"
    """
    return ticker.strip().upper()


def validate_ticker(ticker: str) -> bool:
    """Return True when *ticker* looks like a real exchange symbol.

    Accepts 1-5 uppercase letters, optionally followed by a dot and 1-2
    more letters (BRK.B, BF.A) or a leading caret for index symbols (^GSPC).
    Leading/trailing whitespace is ignored.

    Examples:
        "AAPL"   -> True
        "BRK.B"  -> True
        "^GSPC"  -> True
        "toolong"-> False
        ""       -> False
    """
    clean = sanitize_ticker(ticker)
    if not clean:
        return False
    return bool(_TICKER_RE.match(clean))


def validate_period(period: str) -> bool:
    """Return True when *period* is a valid yfinance history period string.

    Valid values: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max.
    """
    return period.strip().lower() in _VALID_PERIODS
