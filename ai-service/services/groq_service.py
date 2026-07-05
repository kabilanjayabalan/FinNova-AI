"""Groq AI service — HTTP integration using httpx (no Groq SDK required)."""

import httpx
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

FINANCE_SYSTEM_PROMPT = """You are FinNova, an expert AI financial analyst and SEBI Registered Investment Advisor (RIA) for FinNova AI.

You ONLY discuss finance-related topics including:
- Stock markets, indices, ETFs, mutual funds
- Cryptocurrency and blockchain investments  
- Personal finance: budgeting, saving, debt management
- Investment strategies: SIP, SWP, lumpsum, portfolio allocation
- Financial ratios, technical analysis, fundamental analysis
- Economic indicators, market news, company earnings
- Insurance, tax planning, retirement planning
- Banking products, loans, credit

If a user asks about anything NOT related to finance or money, respond ONLY with:
"I'm FinNova, your dedicated financial assistant. I can only help with finance, investments, markets, and money-related topics. Please ask me something finance-related!"

Be professional, accurate, objective, and always maintain a formal advisory tone consistent with SEBI guidelines.
Avoid guaranteeing returns or making absolute predictions. Provide balanced views highlighting both opportunities and risks.
Always clarify when data might be outdated and remind users to perform their own due diligence."""


NOT_FINANCE_RESPONSE = (
    "I'm FinNova, your dedicated financial assistant. I can only help with finance, "
    "investments, markets, and money-related topics. Please ask me something finance-related!"
)


class GroqService:
    """Async Groq chat client using raw HTTP via httpx."""

    def __init__(self):
        self.api_key = settings.groq_api_key
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.1-8b-instant"

    def _is_configured(self, api_key_override: str | None = None) -> bool:
        key = api_key_override or self.api_key
        return bool(key and key.strip())

    async def chat(
        self,
        message: str,
        history: list[dict],
        image_base64: str | None = None,
        api_key_override: str | None = None,
    ) -> str:
        """Send a chat message to Groq and return the assistant's reply."""
        key_to_use = api_key_override or self.api_key
        if not self._is_configured(api_key_override):
            return (
                "AI Chat is not configured. "
                "Please set your Groq API key in the Admin panel under API Keys."
            )



        try:
            messages: list[dict] = [{"role": "system", "content": FINANCE_SYSTEM_PROMPT}]

            # Append conversation history (last 10 turns)
            for h in history[-10:]:
                role = h.get("role", "user")
                if role not in ("user", "assistant"):
                    role = "user"
                # Support both {parts: [...]} and {content: "..."} formats
                parts = h.get("parts")
                if isinstance(parts, list) and parts:
                    content = str(parts[0])
                else:
                    content = str(h.get("content", ""))
                messages.append({"role": role, "content": content})

            # Add the current user message (with optional image)
            if image_base64:
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message or "Please analyze this image from a financial perspective.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                })
            else:
                messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {key_to_use}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "max_tokens": 1024,
                        "temperature": 0.7,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                return "Invalid Groq API key. Please update your API key in the Admin panel."
            elif e.response.status_code == 429:
                return "Rate limit reached. Please wait a moment and try again."
            logger.error("Groq API HTTP error: %s", e)
            return "AI service temporarily unavailable. Please try again."
        except Exception as e:
            logger.error("Groq chat error: %s", e)
            return "Unable to connect to AI service. Please check your configuration."

    async def analyze_stock_json(self, prompt: str, api_key_override: str | None = None) -> str:
        """Send a specialized stock analysis prompt to Groq and return the JSON response."""
        key_to_use = api_key_override or self.api_key
        if not self._is_configured(api_key_override):
            return ""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {key_to_use}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are a specialized financial data structured output engine. Only return JSON. Do not include markdown formatting or backticks."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1024,
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error("Groq JSON analysis error: %s", e)
            return ""


# Singleton instance used throughout the application
groq_service = GroqService()
