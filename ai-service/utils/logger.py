"""Structured logging helpers for the AI service."""

import logging
import sys
from typing import Optional


_LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
)
_DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"

# Track whether the root logger has already been configured so we don't add
# duplicate handlers on repeated imports.
_configured = False


def _configure_root_logger() -> None:
    global _configured
    if _configured:
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=_LOG_FORMAT, datefmt=_DATE_FORMAT))

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    # Avoid duplicate handlers if somehow called twice
    if not root.handlers:
        root.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ("httpx", "httpcore", "urllib3", "yfinance", "peewee"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    _configured = True


_configure_root_logger()


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Return a named logger that inherits from the pre-configured root.

    Usage::

        from utils.logger import get_logger
        logger = get_logger(__name__)
        logger.info("Service started")
    """
    return logging.getLogger(name or __name__)
