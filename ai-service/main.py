"""FastAPI application entry point for the Investment Research AI Service."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from collections import defaultdict

from api.routes import analysis, chat, health, research
from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler — runs startup and shutdown logic."""
    logger.info("=" * 60)
    logger.info("Starting %s", settings.app_name)
    logger.info("Host: %s  Port: %s  Debug: %s", settings.host, settings.port, settings.debug)
    logger.info(
        "Gemini AI: %s",
        "CONFIGURED" if settings.gemini_configured else "NOT configured (set GOOGLE_API_KEY)",
    )
    logger.info("=" * 60)

    yield  # Application is running

    logger.info("Shutting down %s", settings.app_name)


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Investment Research AI Service",
    description=(
        "AI-powered stock analysis, portfolio review, and financial research "
        "using Google Gemini and Yahoo Finance data."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins for development; restrict in production
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Rate Limiting Middleware
# ---------------------------------------------------------------------------
class RateLimitMiddleware:
    def __init__(self, max_requests: int = 15, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.clients = defaultdict(list)

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean up old timestamps
        self.clients[client_ip] = [ts for ts in self.clients[client_ip] if now - ts < self.window_seconds]
        
        if len(self.clients[client_ip]) >= self.max_requests:
            return JSONResponse(
                status_code=429, 
                content={"detail": "Too many requests. Please try again later."}
            )
            
        self.clients[client_ip].append(now)
        return await call_next(request)

app.middleware("http")(RateLimitMiddleware(max_requests=15, window_seconds=60))

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(health.router, tags=["health"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(research.router, prefix="/research", tags=["research"])


# ---------------------------------------------------------------------------
# Root redirect
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root() -> dict:
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", settings.port))
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=port,
        reload=settings.debug,
        log_level="info",
    )
