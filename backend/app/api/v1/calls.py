from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import CallSession, CallEvent, Counselor
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.get("")
def get_calls(
    status: Optional[str] = None,
    school_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(CallSession)
    if status:
        query = query.filter(CallSession.status == status)
    if school_id:
        query = query.filter(CallSession.school_id == school_id)

    calls = query.order_by(CallSession.started_at.desc()).limit(limit).all()
    return [
        {
            "id": c.id,
            "provider_call_id": c.provider_call_id,
            "caller_number": c.caller_number,
            "caller_name": c.caller_name,
            "virtual_number": c.virtual_number,
            "language": c.language,
            "school_id": c.school_id,
            "course_id": c.course_id,
            "branch_id": c.branch_id,
            "intent": c.intent,
            "counselor_requested": c.counselor_requested,
            "status": c.status,
            "started_at": c.started_at,
            "ended_at": c.ended_at,
            "duration_seconds": c.duration_seconds,
            "events_count": len(c.events)
        }
        for c in calls
    ]

@router.get("/{id}")
def get_call(id: str, db: Session = Depends(get_db)):
    call = db.query(CallSession).filter(CallSession.id == id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found.")

    events = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "details": e.details,
            "timestamp": e.timestamp
        }
        for e in sorted(call.events, key=lambda x: x.timestamp)
    ]

    return {
        "id": call.id,
        "provider_call_id": call.provider_call_id,
        "caller_number": call.caller_number,
        "caller_name": call.caller_name,
        "virtual_number": call.virtual_number,
        "language": call.language,
        "school_id": call.school_id,
        "course_id": call.course_id,
        "branch_id": call.branch_id,
        "intent": call.intent,
        "current_workflow_node": call.current_workflow_node,
        "counselor_requested": call.counselor_requested,
        "status": call.status,
        "started_at": call.started_at,
        "answered_at": call.answered_at,
        "ended_at": call.ended_at,
        "duration_seconds": call.duration_seconds,
        "recording_url": call.recording_url,
        "events": events
    }

@router.post("/{id}/terminate")
async def terminate_call(id: str, db: Session = Depends(get_db)):
    call = db.query(CallSession).filter(CallSession.id == id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found.")

    call.status = "COMPLETED"
    call.ended_at = datetime.now(timezone.utc)
    if call.started_at:
        call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())

    # Release any accepted counselor
    for req in call.requests:
        if req.accepted_by:
            c = db.query(Counselor).filter(Counselor.id == req.accepted_by).first()
            if c:
                c.current_state = "AVAILABLE"

    event = CallEvent(
        call_session_id=call.id,
        event_type="CALL_ENDED",
        details="Call ended by operator or caller hangup."
    )
    db.add(event)
    db.commit()

    await ws_manager.broadcast_to_dashboards("CALL_ENDED", {"call_id": call.id})
    return {"success": True, "message": "Call terminated."}
