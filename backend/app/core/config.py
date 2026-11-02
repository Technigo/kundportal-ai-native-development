"""
Configuration for the backend application.
"""
from pydantic import BaseModel


class Settings(BaseModel):
    """Application settings."""
    app_name: str = "Case Management API"
    database_url: str = "sqlite:///./cases.db"


settings = Settings()
