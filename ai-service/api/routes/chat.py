"""Chat routes — conversational AI endpoint powered by Groq (FinBot) with Gemini fallback."""

from __future__ import annotations

from fastapi import APIRouter, Request

from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("")
async def chat_endpoint(request: Request) -> dict:
    """Send a message to FinBot and receive an AI-generated reply.

    Supports multi-turn conversation via ``history`` and optional ``image``
    (base64-encoded string) for vision queries.

    Primary provider: Groq (llama3-8b-8192).
    Fallback: Gemini (if Groq is not configured).
    """
    body = await request.json()
    message: str = body.get("message", "")
    history: list[dict] = body.get("history", [])
    image: str | None = body.get("image", None)  # base64 image string

    # ── Primary: Groq ──────────────────────────────────────────────
    from services.groq_service import groq_service

    groq_key = request.headers.get("x-groq-api-key")

    if groq_service._is_configured(api_key_override=groq_key):
        response_text = await groq_service.chat(message, history, image, api_key_override=groq_key)
        return {"message": response_text, "sources": []}

    # ── Fallback: Gemini ───────────────────────────────────────────
    try:
        from api.dependencies import get_gemini_service
        from services.gemini_service import GeminiService

        # Build a one-shot dependency instance (no DI container needed here)
        from config.settings import settings
        from services.gemini_service import GeminiService as _GS

        gemini = _GS()
        if gemini.available:
            # Build context message
            user_message = message
            context = body.get("context")
            if context:
                user_message = (
                    f"[Context: User is asking about stock ticker {context}]\n\n{message}"
                )
            reply = await gemini.chat(message=user_message, history=history)
            sources: list[str] = []
            if context:
                sources.append(f"Yahoo Finance data for {context}")
            return {"message": reply, "sources": sources}
    except Exception as exc:
        logger.warning("Gemini fallback failed: %s", exc)

    # ── Neither configured ─────────────────────────────────────────
    return {
        "message": (
            "AI Chat is not configured. "
            "Please set your Groq API key in the Admin panel under API Keys."
        ),
        "sources": [],
    }
