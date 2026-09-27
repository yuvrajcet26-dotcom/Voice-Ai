import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import CallSession, CallEvent, PhoneNumber, Counselor
from app.services.telephony.exotel_provider import exotel_provider
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("telephony_service")

class TelephonyService:
    @classmethod
    def handle_incoming_call(
        cls,
        db: Session,
        provider_call_id: str,
        caller_number: str,
        virtual_number: str,
        caller_name: Optional[str] = "Student / Parent"
    ) -> CallSession:
        """
        Handle incoming call from Exotel or voice simulator.
        Create session, register event, notify dashboard.
        """
        # Idempotency check: if session with provider_call_id already exists, return it
        existing = db.query(CallSession).filter(CallSession.provider_call_id == provider_call_id).first()
        if existing:
            return existing

        now = datetime.now(timezone.utc)
        session = CallSession(
            provider_call_id=provider_call_id,
            caller_number=caller_number,
            caller_name=caller_name,
            virtual_number=virtual_number,
            status="ANSWERED",
            started_at=now,
            answered_at=now
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Log event
        event = CallEvent(
            call_session_id=session.id,
            event_type="CALL_RECEIVED",
            details=f"Incoming call from {caller_number} to ExoPhone {virtual_number}"
        )
        db.add(event)
        db.commit()

        logger.info(f"New incoming call session created: {session.id}")
        return session

    @classmethod
    def handle_call_status(
        cls,
        db: Session,
        provider_call_id: str,
        status: str,
        duration: int = 0,
        recording_url: Optional[str] = None
    ) -> Optional[CallSession]:
        """
        Process call status callback from Exotel.
        Updates duration, recording, and releases any locked counselor if terminated.
        """
        session = db.query(CallSession).filter(CallSession.provider_call_id == provider_call_id).first()
        if not session:
            return None

        session.ended_at = datetime.now(timezone.utc)
        session.duration_seconds = duration
        if recording_url:
            session.recording_url = recording_url

        if status.lower() in ["completed", "terminated"]:
            session.status = "COMPLETED"
        elif status.lower() in ["busy", "failed", "no-answer"]:
            session.status = "FAILED"

        event = CallEvent(
            call_session_id=session.id,
            event_type="CALL_ENDED",
            details=f"Status: {status}, Duration: {duration}s"
        )
        db.add(event)
        db.commit()

        # If a counselor was in this call, release them back to AVAILABLE
        # Find any accepted request
        for req in session.requests:
            if req.accepted_by:
                counselor = db.query(Counselor).filter(Counselor.id == req.accepted_by).first()
                if counselor and counselor.current_state == "BUSY":
                    counselor.current_state = "AVAILABLE"
                    db.commit()
                    logger.info(f"Released counselor {counselor.id} back to AVAILABLE upon call termination.")

        return session

telephony_service = TelephonyService()
