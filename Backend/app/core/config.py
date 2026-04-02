"""
Application configuration settings
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )
    
    # Project info
    PROJECT_NAME: str = "AI Programming Tutor"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse CORS origins from a comma-separated string."""
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_tutor"
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def ensure_async_database_url(cls, value: str) -> str:
        """Convert sync postgres URL forms to asyncpg for SQLAlchemy async engine."""
        if not isinstance(value, str):
            return value

        url = value.strip()
        if url.startswith("postgresql+psycopg2://"):
            return url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    
    # AI/LLM Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_MAX_TOKENS: int = 4000
    LLM_TEMPERATURE: float = 0.7
    
    # Code execution (for testing student code)
    CODE_EXECUTION_TIMEOUT: int = 30  # seconds
    MAX_CODE_LENGTH: int = 50000  # characters
    
    # Problem settings
    DIFFICULTY_LEVELS: List[str] = ["beginner", "intermediate", "advanced"]
    TOPICS: List[str] = [
        "variables_and_types",
        "control_flow",
        "functions",
        "arrays",
        "strings",
        "linked_lists",
        "stacks_and_queues",
        "trees",
        "graphs",
        "sorting",
        "searching",
        "recursion",
        "dynamic_programming",
        "object_oriented_programming"
    ]
    
    # Feedback configuration
    ENABLE_HINTS: bool = True
    MAX_HINTS_PER_PROBLEM: int = 3
    ENABLE_STEP_BY_STEP_FEEDBACK: bool = True

    # Server runtime
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True


settings = Settings()
