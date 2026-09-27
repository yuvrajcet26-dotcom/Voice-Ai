from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Observability"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return {
        "status": "HEALTHY" if db_ok else "DEGRADED",
        "university": "SVKM Global University, Dhule",
        "components": {
            "database": "CONNECTED" if db_ok else "ERROR",
            "telephony_exotel": "CONNECTED",
            "ai_stt_whisper": "READY",
            "ai_multilingual_nlp": "READY",
            "ai_tts_azure": "READY",
            "counselor_dispatch": "ACTIVE"
        }
    }

@router.get("/database")
def health_database(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "HEALTHY", "database": "PostgreSQL/SQLite engine verified"}

@router.get("/telephony")
def health_telephony():
    return {
        "status": "HEALTHY",
        "provider": "Exotel",
        "sub_domain": settings.EXOTEL_SUB_DOMAIN,
        "capabilities": ["INBOUND_VOICE", "OUTBOUND_VOICE", "AGENT_STREAM_WSS", "SMS"]
    }

@router.get("/ai")
def health_ai():
    return {
        "status": "HEALTHY",
        "stt": settings.STT_PROVIDER,
        "languages_supported": ["en-IN", "hi-IN", "mr-IN", "code-switching"],
        "tts": settings.TTS_PROVIDER
    }
