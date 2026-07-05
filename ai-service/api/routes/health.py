"""Health check routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from api.dependencies import get_gemini_service
from models.response_models import HealthResponse
from services.gemini_service import GeminiService
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Basic liveness probe — always returns 200 OK when the service is up."""
    return HealthResponse(
        status="ok",
        service="investment-research-ai",
        version="1.0.0",
    )


@router.get("/health/gemini", response_model=HealthResponse, tags=["health"])
async def gemini_health(
    request: Request,
) -> HealthResponse:
    """Connectivity probe for the Gemini API.

    Sends a minimal test prompt and reports whether Gemini is reachable.
    """
    gemini_key = request.headers.get("x-gemini-api-key")
    gemini = GeminiService(api_key_override=gemini_key)
    if not gemini.available:
        return HealthResponse(
            status="degraded",
            service="investment-research-ai",
            version="1.0.0",
            gemini_available=False,
            details={"reason": "GOOGLE_API_KEY is not configured"},
        )

    reachable = await gemini.ping()

    return HealthResponse(
        status="ok" if reachable else "degraded",
        service="investment-research-ai",
        version="1.0.0",
        gemini_available=reachable,
        details={
            "model": "gemini-1.5-flash",
            "reachable": reachable,
        },
    )
