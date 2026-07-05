"""Google Gemini integration service.

All Gemini SDK calls are inherently synchronous in the current SDK version;
they are therefore wrapped with ``asyncio.to_thread`` so the FastAPI event
loop is not blocked.
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Any

import google.generativeai as genai

from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

_PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

# User-friendly message shown when the API key is missing or invalid
_API_KEY_UNAVAILABLE_MSG = (
    "AI features are currently unavailable. "
    "Please configure a valid Google API key in the application settings."
)


def _load_prompt(filename: str) -> str:
    """Read a prompt template from the prompts directory."""
    path = _PROMPTS_DIR / filename
    try:
        return path.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        logger.warning("Prompt file not found: %s", path)
        return ""


def _is_api_key_error(exc: Exception) -> bool:
    """Return True if the exception is caused by a missing/invalid API key."""
    msg = str(exc).upper()
    return any(
        token in msg
        for token in (
            "API_KEY_INVALID",
            "API KEY NOT VALID",
            "INVALID API KEY",
            "PERMISSION_DENIED",
            "UNAUTHENTICATED",
            "400",
        )
    )


class GeminiService:
    """Wrapper around the Google Generative AI SDK for Gemini 1.5 Flash."""

    def __init__(self, api_key_override: str | None = None) -> None:
        self._available = False
        key_to_use = api_key_override or settings.google_api_key
        
        # Determine if we have a key configured
        if key_to_use and key_to_use.strip():
            try:
                genai.configure(api_key=key_to_use)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self._available = True
                logger.info("Gemini service initialised (gemini-1.5-flash)")
            except Exception as exc:
                logger.error("Failed to configure Gemini: %s", exc)
                self.model = None
        else:
            logger.warning(
                "GOOGLE_API_KEY is not set — Gemini features will be disabled."
            )
            self.model = None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @property
    def available(self) -> bool:
        return self._available and self.model is not None

    def _require_gemini(self) -> None:
        if not self.available:
            raise RuntimeError(_API_KEY_UNAVAILABLE_MSG)

    def _generate_sync(self, prompt: str) -> str:
        """Blocking call to Gemini — must be run via asyncio.to_thread."""
        response = self.model.generate_content(prompt)
        return response.text or ""

    def _chat_sync(self, history: list[dict], message: str, system_prompt: str) -> str:
        """Blocking multi-turn chat — must be run via asyncio.to_thread."""
        # Prepend system instructions as the first user turn if provided
        chat_history: list[dict] = []
        if system_prompt:
            chat_history.append(
                {"role": "user", "parts": [system_prompt]}
            )
            chat_history.append(
                {"role": "model", "parts": ["Understood. I'm ready to assist."]}
            )

        for turn in history:
            role = turn.get("role", "user")
            parts = turn.get("parts", [])
            if isinstance(parts, str):
                parts = [parts]
            if role in ("user", "model") and parts:
                chat_history.append({"role": role, "parts": parts})

        chat = self.model.start_chat(history=chat_history)
        response = chat.send_message(message)
        return response.text or ""

    # ------------------------------------------------------------------
    # Public async methods
    # ------------------------------------------------------------------

    async def analyze_stock(self, stock_data: dict, prompt_template: str = "") -> str:
        """Generate a narrative stock analysis from stock data dict."""
        self._require_gemini()

        if not prompt_template:
            prompt_template = _load_prompt("stock_analysis_prompt.txt")

        # Serialise stock data concisely
        data_str = json.dumps(stock_data, indent=2, default=str)

        prompt = (
            f"{prompt_template}\n\n"
            f"=== STOCK DATA ===\n{data_str}\n\n"
            "Please provide your analysis now."
        )

        try:
            return await asyncio.to_thread(self._generate_sync, prompt)
        except Exception as exc:
            logger.error("Gemini analyze_stock failed: %s", exc)
            if _is_api_key_error(exc):
                return _API_KEY_UNAVAILABLE_MSG
            return f"AI analysis unavailable at this time. Please try again later."

    async def chat(
        self,
        message: str,
        history: list[dict],
        system_prompt: str = "",
    ) -> str:
        """Multi-turn conversation with Gemini."""
        self._require_gemini()

        if not system_prompt:
            system_prompt = _load_prompt("chat_prompt.txt")

        try:
            return await asyncio.to_thread(
                self._chat_sync, history, message, system_prompt
            )
        except Exception as exc:
            logger.error("Gemini chat failed: %s", exc)
            if _is_api_key_error(exc):
                return _API_KEY_UNAVAILABLE_MSG
            return "I'm sorry, I encountered an error. Please try again later."

    async def analyze_sentiment(
        self, headlines: list[str], ticker: str
    ) -> dict:
        """Analyse news sentiment for a ticker from a list of headlines.

        Returns a dict with keys: sentiment, score, confidence, summary, key_factors.
        """
        self._require_gemini()

        if not headlines:
            return {
                "sentiment": "NEUTRAL",
                "score": 0.0,
                "confidence": 0.3,
                "summary": "No recent news found to analyse.",
                "key_factors": [],
            }

        headlines_text = "\n".join(f"- {h}" for h in headlines[:15])
        prompt = (
            f"You are a financial sentiment analyst. Analyse the following recent news "
            f"headlines for stock ticker {ticker} and return a JSON object with these "
            f"exact keys:\n"
            f"  - sentiment: one of BULLISH, BEARISH, NEUTRAL\n"
            f"  - score: float from -1.0 (very bearish) to +1.0 (very bullish)\n"
            f"  - confidence: float from 0.0 to 1.0 indicating confidence in the assessment\n"
            f"  - summary: 2-3 sentence summary of the overall sentiment\n"
            f"  - key_factors: list of 3-5 strings, each a brief factor driving the sentiment\n\n"
            f"Headlines:\n{headlines_text}\n\n"
            f"Respond ONLY with the JSON object, no markdown fences."
        )

        try:
            raw = await asyncio.to_thread(self._generate_sync, prompt)
            # Strip markdown code fences if present
            clean = re.sub(r"```(?:json)?|```", "", raw).strip()
            data = json.loads(clean)

            return {
                "sentiment": str(data.get("sentiment", "NEUTRAL")).upper(),
                "score": float(data.get("score", 0.0)),
                "confidence": float(data.get("confidence", 0.5)),
                "summary": str(data.get("summary", "")),
                "key_factors": [str(f) for f in data.get("key_factors", [])],
            }
        except json.JSONDecodeError as exc:
            logger.warning("Gemini returned non-JSON sentiment response: %s", exc)
            # Fallback: try to infer from raw text
            upper = raw.upper()
            if "BULLISH" in upper:
                sentiment = "BULLISH"
                score = 0.5
            elif "BEARISH" in upper:
                sentiment = "BEARISH"
                score = -0.5
            else:
                sentiment = "NEUTRAL"
                score = 0.0
            return {
                "sentiment": sentiment,
                "score": score,
                "confidence": 0.4,
                "summary": raw[:300],
                "key_factors": [],
            }
        except Exception as exc:
            logger.error("Gemini analyze_sentiment failed: %s", exc)
            if _is_api_key_error(exc):
                return {
                    "sentiment": "NEUTRAL",
                    "score": 0.0,
                    "confidence": 0.0,
                    "summary": _API_KEY_UNAVAILABLE_MSG,
                    "key_factors": [],
                }
            return {
                "sentiment": "NEUTRAL",
                "score": 0.0,
                "confidence": 0.0,
                "summary": "Sentiment analysis unavailable. Please try again later.",
                "key_factors": [],
            }

    async def analyze_portfolio(
        self, holdings_data: list[dict], prompt_template: str = ""
    ) -> str:
        """Generate AI insights for a portfolio of holdings."""
        self._require_gemini()

        if not prompt_template:
            prompt_template = _load_prompt("portfolio_prompt.txt")

        holdings_str = json.dumps(holdings_data, indent=2, default=str)
        prompt = (
            f"{prompt_template}\n\n"
            f"=== PORTFOLIO HOLDINGS ===\n{holdings_str}\n\n"
            "Please provide your portfolio analysis now."
        )

        try:
            return await asyncio.to_thread(self._generate_sync, prompt)
        except Exception as exc:
            logger.error("Gemini analyze_portfolio failed: %s", exc)
            if _is_api_key_error(exc):
                return _API_KEY_UNAVAILABLE_MSG
            return "Portfolio AI analysis unavailable. Please try again later."

    async def ping(self) -> bool:
        """Return True if Gemini is reachable with a minimal test prompt."""
        if not self.available:
            return False
        try:
            result = await asyncio.to_thread(
                self._generate_sync, "Reply with the single word: ok"
            )
            return bool(result)
        except Exception as exc:
            logger.warning("Gemini ping failed: %s", exc)
            return False
