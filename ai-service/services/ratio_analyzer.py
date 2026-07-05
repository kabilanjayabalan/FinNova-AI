"""Financial ratio extractor — pulls key valuation and health ratios from
yfinance info dicts.
"""

from __future__ import annotations

import math
from typing import Any

from models.response_models import FinancialRatios
from utils.logger import get_logger

logger = get_logger(__name__)


def _safe(value: Any) -> float | None:
    """Convert value to float; return None for None / NaN / Inf."""
    if value is None:
        return None
    try:
        f = float(value)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except (TypeError, ValueError):
        return None


class RatioAnalyzer:
    """Extracts financial ratios from yfinance info and financials dicts."""

    def calculate_ratios(self, info: dict, financials: dict) -> FinancialRatios:
        """Return a FinancialRatios object populated from yfinance data.

        Parameters
        ----------
        info:
            The normalised info dict returned by ``FinancialDataService.get_stock_info``.
        financials:
            The financials dict returned by ``FinancialDataService.get_financials``.
        """
        try:
            revenue_growth = _safe(info.get("revenue_growth"))

            # Attempt to derive revenue growth from income statement if not in info
            if revenue_growth is None:
                revenue_growth = self._derive_revenue_growth(financials)

            return FinancialRatios(
                pe_ratio=_safe(info.get("pe_ratio")),
                pb_ratio=_safe(info.get("pb_ratio")),
                eps=_safe(info.get("eps")),
                debt_to_equity=_safe(info.get("debt_to_equity")),
                roe=_safe(info.get("roe")),
                current_ratio=_safe(info.get("current_ratio")),
                dividend_yield=_safe(info.get("dividend_yield")),
                revenue_growth=revenue_growth,
            )
        except Exception as exc:
            logger.error("RatioAnalyzer.calculate_ratios failed: %s", exc)
            return FinancialRatios()

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _derive_revenue_growth(self, financials: dict) -> float | None:
        """Try to compute YoY revenue growth from the income statement."""
        try:
            income = financials.get("income_statement", {})
            if not income:
                return None

            # Columns are typically date strings sorted descending
            date_keys = sorted(income.keys(), reverse=True)
            if len(date_keys) < 2:
                return None

            latest_col = income[date_keys[0]]
            prior_col = income[date_keys[1]]

            # Try common revenue row labels
            for label in ("Total Revenue", "Revenue", "Sales"):
                latest_rev = _safe(latest_col.get(label))
                prior_rev = _safe(prior_col.get(label))
                if latest_rev is not None and prior_rev and prior_rev != 0:
                    return (latest_rev - prior_rev) / abs(prior_rev)
        except Exception:
            pass
        return None
