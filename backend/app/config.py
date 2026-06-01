from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inventory & Order Management API"
    API_V1_STR: str = "/api"
    
    # Database connection URL (PostgreSQL)
    # Default is for local Docker Compose setup
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres_secure_pass@db:5432/inventory_db",
        env="DATABASE_URL"
    )

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
