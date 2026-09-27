from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import SystemSetting, MultilingualMessage
from app.core.config import settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    db_settings = db.query(SystemSetting).all()
    messages = db.query(MultilingualMessage).all()

    settings_dict = {s.setting_key: s.setting_value for s in db_settings}

    return {
        "system": {
            "university_name": settings_dict.get("university_name", "SVKM Global University, Dhule"),
            "timezone": settings_dict.get("timezone", settings.TIMEZONE),
            "default_language": settings_dict.get("default_language", "en"),
            "supported_languages": ["en", "hi", "mr"],
            "max_call_duration_seconds": int(settings_dict.get("max_call_duration_seconds", settings.MAX_CALL_DURATION_SECONDS)),
            "silence_timeout_seconds": int(settings_dict.get("silence_timeout_seconds", settings.SILENCE_TIMEOUT_SECONDS)),
            "counselor_acceptance_timeout": int(settings_dict.get("counselor_acceptance_timeout", settings.COUNSELOR_ACCEPTANCE_TIMEOUT_SECONDS)),
            "ai_provider": settings.AI_PROVIDER,
            "stt_provider": settings.STT_PROVIDER,
            "tts_provider": settings.TTS_PROVIDER,
            "telephony_provider": "Exotel",
            "telephony_connected": True
        },
        "messages": [
            {
                "id": m.id,
                "message_key": m.message_key,
                "language": m.language,
                "message_text": m.message_text,
                "status": m.status
            }
            for m in messages
        ]
    }

@router.put("")
def update_settings(payload: Dict[str, Any], db: Session = Depends(get_db)):
    system_data = payload.get("system", {})
    for key, value in system_data.items():
        record = db.query(SystemSetting).filter(SystemSetting.setting_key == key).first()
        if record:
            record.setting_value = str(value)
        else:
            record = SystemSetting(setting_key=key, setting_value=str(value))
            db.add(record)

    db.commit()
    return {"success": True, "message": "Settings updated successfully."}
