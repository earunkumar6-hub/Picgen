from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # OpenAI (prompt generation/enhancement + OpenAI Images)
    openai_api_key: str | None = None
    openai_text_model: str = "gpt-5"
    openai_text_model_fallback: str = "gpt-4o"
    openai_image_model: str = "gpt-image-1"

    # FLUX Pro (Replicate)
    replicate_api_token: str | None = None
    flux_model_version: str = "black-forest-labs/flux-1.1-pro"

    # Ideogram
    ideogram_api_key: str | None = None

    # Google Imagen (Vertex AI)
    google_cloud_project: str | None = None
    google_cloud_location: str = "us-central1"
    google_application_credentials: str | None = None

    # App
    database_url: str = "sqlite:///./picgen.db"
    storage_dir: str = "./storage/images"
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def storage_path(self) -> Path:
        path = Path(self.storage_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
