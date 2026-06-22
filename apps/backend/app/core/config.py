from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://fittrack:fittrack_dev_password@localhost:5432/fittrack"
    jwt_secret_key: str = "change-me-before-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    cors_origins_raw: str = Field(default="http://localhost:3000", validation_alias="CORS_ORIGINS")

    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()
