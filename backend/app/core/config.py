"""Application-wide configuration loaded from environment variables."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Veridian"
    environment: str = "development"
    secret_key: str = "insecure-dev-secret-change-me"
    access_token_expire_minutes: int = 1440
    algorithm: str = "HS256"

    database_url: str = "sqlite:///./veridian.db"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    max_upload_size_mb: int = 50
    storage_dir: str = "./storage"

    llm_provider: str = ""
    llm_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def storage_path(self) -> Path:
        path = Path(self.storage_dir)
        path.mkdir(parents=True, exist_ok=True)
        (path / "datasets").mkdir(parents=True, exist_ok=True)
        (path / "reports").mkdir(parents=True, exist_ok=True)
        return path

    @property
    def datasets_path(self) -> Path:
        p = self.storage_path / "datasets"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def reports_path(self) -> Path:
        p = self.storage_path / "reports"
        p.mkdir(parents=True, exist_ok=True)
        return p


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
