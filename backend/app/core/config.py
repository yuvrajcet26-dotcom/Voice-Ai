import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SVKM Global University, Dhule - AI Voice Admission & Routing Platform"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./svkm_voice.db")
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "svkm_dhule_super_secret_jwt_key_2026_antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # University Timezone
    TIMEZONE: str = "Asia/Kolkata"
    
    # Telephony Provider (Exotel)
    EXOTEL_ACCOUNT_SID: str = os.getenv("EXOTEL_ACCOUNT_SID", "svkm_exotel_sid_dhule")
    EXOTEL_API_KEY: str = os.getenv("EXOTEL_API_KEY", "exotel_api_key_sample")
    EXOTEL_API_TOKEN: str = os.getenv("EXOTEL_API_TOKEN", "exotel_api_token_sample")
    EXOTEL_SUB_DOMAIN: str = os.getenv("EXOTEL_SUB_DOMAIN", "api.exotel.com")
    
    # AI & Audio Services
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "multilingual_ai_engine")
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "whisper_large_v3")
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "azure_neural_tts")
    
    # Counselor Dispatch Rules
    COUNSELOR_ACCEPTANCE_TIMEOUT_SECONDS: int = 20
    COUNSELOR_RETRY_LIMIT: int = 2
    
    # Call Limits
    MAX_CALL_DURATION_SECONDS: int = 600
    SILENCE_TIMEOUT_SECONDS: int = 15
    
    # Notification Channels
    NOTIFICATION_CHANNELS: List[str] = ["dashboard", "email", "whatsapp", "sms", "missed_call"]
    
    # Frontend URL for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    class Config:
        case_sensitive = True

settings = Settings()
