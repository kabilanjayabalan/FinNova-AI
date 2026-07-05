"""Formatting helpers for financial figures."""

from __future__ import annotations

import math
from typing import Optional


def format_large_number(value: Optional[float]) -> str:
    """Format a raw number to a human-readable magnitude string.

    Examples:
        1_230_000     -> "1.23M"
        4_560_000_000 -> "4.56B"
        999           -> "999"
    """
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/A"

    abs_val = abs(value)
    sign = "-" if value < 0 else ""

    if abs_val >= 1_000_000_000_000:
        return f"{sign}{abs_val / 1_000_000_000_000:.2f}T"
    if abs_val >= 1_000_000_000:
        return f"{sign}{abs_val / 1_000_000_000:.2f}B"
    if abs_val >= 1_000_000:
        return f"{sign}{abs_val / 1_000_000:.2f}M"
    if abs_val >= 1_000:
        return f"{sign}{abs_val / 1_000:.2f}K"
    return f"{sign}{abs_val:.2f}"


def format_currency(value: Optional[float], currency: str = "USD") -> str:
    """Format a monetary value with its currency symbol and magnitude suffix.

    Examples:
        1_230_000, "USD"  -> "$1.23M"
        4_560_000_000_000 -> "$4.56T"
    """
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/A"

    symbols: dict[str, str] = {
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥",
        "INR": "₹",
    }
    symbol = symbols.get(currency.upper(), currency + " ")

    abs_val = abs(value)
    sign = "-" if value < 0 else ""

    if abs_val >= 1_000_000_000_000:
        return f"{sign}{symbol}{abs_val / 1_000_000_000_000:.2f}T"
    if abs_val >= 1_000_000_000:
        return f"{sign}{symbol}{abs_val / 1_000_000_000:.2f}B"
    if abs_val >= 1_000_000:
        return f"{sign}{symbol}{abs_val / 1_000_000:.2f}M"
    if abs_val >= 1_000:
        return f"{sign}{symbol}{abs_val / 1_000:.2f}K"
    return f"{sign}{symbol}{abs_val:,.2f}"


def format_percentage(value: Optional[float]) -> str:
    """Format a decimal or percentage value with a sign prefix.

    The function auto-detects whether the value is already in percentage
    form (abs > 1 assumed to be percent) or decimal form (abs <= 1).

    Examples:
        0.0123  -> "+1.23%"
        -0.0045 -> "-0.45%"
        15.7    -> "+15.70%"
    """
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/A"

    # Normalise: if the absolute value is <= 1 treat as decimal fraction
    pct = value * 100 if abs(value) <= 1 else value
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct:.2f}%"


def format_market_cap(value: Optional[float]) -> str:
    """Return a market-cap string with an appropriate label tier.

    Examples:
        2_500_000_000_000 -> "$2.50T (Mega Cap)"
        85_000_000_000    -> "$85.00B (Large Cap)"
        3_000_000_000     -> "$3.00B (Mid Cap)"
        500_000_000       -> "$500.00M (Small Cap)"
        80_000_000        -> "$80.00M (Micro Cap)"
    """
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return "N/A"

    formatted = format_currency(value)

    if value >= 200_000_000_000:
        tier = "Mega Cap"
    elif value >= 10_000_000_000:
        tier = "Large Cap"
    elif value >= 2_000_000_000:
        tier = "Mid Cap"
    elif value >= 300_000_000:
        tier = "Small Cap"
    elif value >= 50_000_000:
        tier = "Micro Cap"
    else:
        tier = "Nano Cap"

    return f"{formatted} ({tier})"
