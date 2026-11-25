import os
from pathlib import Path
from dotenv import load_dotenv

# Automatically load .env if present
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")
load_dotenv(_backend_dir.parent / ".env")

class Settings:
    PROJECT_NAME: str = "Nexgile-TravAI Travel & Hospitality Portal"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./nexgile_travai.db")
    MONGODB_CLUSTER: str = "cluster0.tf8lwiu.mongodb.net"
    MONGODB_URI: str = os.getenv(
        "MONGODB_URI",
        "mongodb+srv://<db_username>:<db_password>@cluster0.tf8lwiu.mongodb.net/?retryWrites=true&w=majority"
    )
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "nexgile_travai")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nexgile-travai-dev-secret-key-2026")
    ACCESS_TOKEN_EXPIRE_SECONDS: int = 60 * 60 * 24 * 7  # 7 days
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_U3zTfszdEAEPYo")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "nSoe34HwSmawsgq5TTz9B0tD")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

settings = Settings()
