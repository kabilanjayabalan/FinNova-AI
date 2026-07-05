"""Application settings loaded from environment variables / .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application configuration.

    Values are read from environment variables first; if not set they fall
    back to the defaults defined here.  A `.env` file in the project root
    is also loaded automatically.
    """

    google_api_key: str = ""
    groq_api_key: str = ""
    port: int = 8001
    host: str = "0.0.0.0"
    debug: bool = False
    app_name: str = "Investment Research AI Service"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def gemini_configured(self) -> bool:
        """Return True when a non-empty API key is present."""
        return bool(self.google_api_key and self.google_api_key.strip())


# Singleton instance used throughout the application
settings = Settings()
