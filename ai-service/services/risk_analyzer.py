"""Quantitative risk analysis — calculates volatility, Sharpe ratio, VaR,
max drawdown, and assigns a qualitative risk level.
"""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from models.response_models import RiskMetrics
from utils.logger import get_logger

logger = get_logger(__name__)

# Risk-free rate assumption (annualised, e.g. 5% US T-bill)
_RISK_FREE_RATE = 0.05
_TRADING_DAYS = 252


def _safe(value: Any) -> float | None:
    if value is None:
        return None
    try:
        f = float(value)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except (TypeError, ValueError):
        return None


def _classify_risk(volatility: float | None) -> str:
    """Map annualised volatility to a qualitative risk tier."""
    if volatility is None:
        return "UNKNOWN"
    if volatility < 0.15:
        return "LOW"
    if volatility < 0.25:
        return "MEDIUM"
    if volatility < 0.40:
        return "HIGH"
    return "VERY_HIGH"


class RiskAnalyzer:
    """Computes risk metrics from a list of OHLCV history dicts and info."""

    def calculate_risk(self, history: list[dict], info: dict) -> RiskMetrics:
        """Calculate and return RiskMetrics.

        Parameters
        ----------
        history:
            List of ``{date, open, high, low, close, volume}`` dicts from
            ``FinancialDataService.get_historical_prices``.
        info:
            Normalised info dict (for beta, etc.).
        """
        try:
            closes = [
                row["close"]
                for row in history
                if row.get("close") is not None
            ]

            if len(closes) < 10:
                return RiskMetrics(
                    beta=_safe(info.get("beta")),
                    risk_level="UNKNOWN",
                )

            prices = np.array(closes, dtype=float)
            returns = np.diff(prices) / prices[:-1]  # simple daily returns

            # Remove non-finite returns
            returns = returns[np.isfinite(returns)]
            if len(returns) == 0:
                return RiskMetrics(
                    beta=_safe(info.get("beta")),
                    risk_level="UNKNOWN",
                )

            # Annualised volatility
            daily_std = float(np.std(returns, ddof=1))
            volatility = daily_std * math.sqrt(_TRADING_DAYS)

            # Annualised mean return
            mean_daily = float(np.mean(returns))
            annual_return = mean_daily * _TRADING_DAYS

            # Sharpe ratio
            sharpe: float | None = None
            if volatility > 0:
                sharpe = (annual_return - _RISK_FREE_RATE) / volatility

            # Value at Risk at 95% confidence (daily)
            var_95 = float(np.percentile(returns, 5))

            # Max drawdown
            max_drawdown = self._calculate_max_drawdown(prices)

            # Beta from yfinance info (already fetched from market)
            beta = _safe(info.get("beta"))

            risk_level = _classify_risk(volatility)

            return RiskMetrics(
                beta=beta,
                volatility=round(volatility, 4),
                sharpe_ratio=round(sharpe, 4) if sharpe is not None else None,
                var_95=round(var_95, 4),
                max_drawdown=round(max_drawdown, 4),
                risk_level=risk_level,
            )

        except Exception as exc:
            logger.error("RiskAnalyzer.calculate_risk failed: %s", exc)
            return RiskMetrics(
                beta=_safe(info.get("beta")) if info else None,
                risk_level="UNKNOWN",
            )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _calculate_max_drawdown(self, prices: np.ndarray) -> float:
        """Compute the maximum peak-to-trough percentage drawdown."""
        if len(prices) == 0:
            return 0.0
        cumulative_max = np.maximum.accumulate(prices)
        drawdowns = (prices - cumulative_max) / cumulative_max
        return float(np.min(drawdowns))  # most negative value
