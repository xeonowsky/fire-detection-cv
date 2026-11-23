from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    data_dir: Path = Path("/data")
    database_url: str = "sqlite:////data/app.db"
    jwt_secret: str
    jwt_expire_minutes: int = 60 * 24
    cors_origins: str = "http://localhost:3000"

    max_video_seconds: int = 270
    max_video_megabytes: int = 1024
    allowed_video_extensions: tuple[str, ...] = (".mp4", ".mov", ".avi")
    demo_analysis_seconds: int = 20

    @property
    def uploads_dir(self) -> Path:
        return self.data_dir / "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
