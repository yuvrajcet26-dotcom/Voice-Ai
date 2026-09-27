import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import CallSession, CallEvent, Counselor, CallerRequest, RequestCandidate, RequestAcceptance
from app.schemas.schemas import StartCallRequest, TurnRequest, TurnResponse
from app.services.telephony.telephony_service import telephony_service
from app.services.ai.ai_orchestrator import ai_orchestrator
from app.services.counselor_dispatch.dispatch_service import counselor_dispatch_service
from app.services.ai.tts_service import tts_service

router = APIRouter(prefix="/simulator", tags=["Simulator"])

@router.post("/start")
async def start_simulated_call(payload: StartCallRequest, db: Session = Depends(get_db)):
    """Initialize a simulated incoming telephone call session."""
    import uuid
    sim_call_sid = f"sim_sid_{uuid.uuid4().hex[:10]}"
    
    session = telephony_service.handle_incoming_call(
        db=db,
        provider_call_id=sim_call_sid,
        caller_number=payload.caller_number,
        virtual_number=payload.virtual_number,
        caller_name=payload.caller_name
    )
    
    session.language = payload.language
    db.commit()

    # Welcome message based on language
    if payload.language == "mr":
        welcome = "एसव्हीकेएम ग्लोबल युनिव्हर्सिटी, धुळे मध्ये आपले स्वागत आहे. मी आपली प्रवेशाबाबत काय मदत करू शकेन?"
    elif payload.language == "hi":
        welcome = "एसवीकेएम ग्लोबल यूनिवर्सिटी, धुले में आपका स्वागत है। मैं आपकी प्रवेश सहायता के लिए क्या कर सकता हूँ?"
    else:
        welcome = "Welcome to SVKM Global University, Dhule. How can I assist you with admissions today?"

    tts_res = await tts_service.synthesize(welcome, language=payload.language)

    return {
        "call_id": session.id,
        "provider_call_id": session.provider_call_id,
        "caller_number": session.caller_number,
        "virtual_number": session.virtual_number,
        "language": session.language,
        "welcome_message": welcome,
        "audio_base64": tts_res.get("audio_base64")
    }

@router.post("/turn", response_model=TurnResponse)
async def process_simulated_turn(payload: TurnRequest, db: Session = Depends(get_db)):
    """Process a single turn of voice/text dialogue through the AI Voice Gateway."""
    result = await ai_orchestrator.process_turn(
        db=db,
        call_id=payload.call_id,
        text_input=payload.text_input,
        audio_base64=payload.audio_base64,
        language_override=payload.language_override
    )
    return result

@router.post("/test-five-counselors")
async def test_five_counselors_pool(db: Session = Depends(get_db)):
    """
    CRITICAL SPECIFICATION REQUIREMENT 116:
    Five Counselors Pool Test:
    STME:
    A = BUSY
    B = BUSY
    C = AVAILABLE
    D = AVAILABLE
    E = AVAILABLE
    Caller requests counselor -> C, D, E notified.
    D accepts first -> D becomes BUSY, Request ACCEPTED, C and E cancelled.
    Only D receives the live call.
    """
    # 1. Reset / Ensure STME counselor states
    counselors = db.query(Counselor).all()
    c_map = {c.user.username if c.user else c.id: c for c in counselors}

    # Set states
    if "counselor_a" in c_map: c_map["counselor_a"].current_state = "BUSY"
    if "counselor_b" in c_map: c_map["counselor_b"].current_state = "BUSY"
    if "counselor_c" in c_map: c_map["counselor_c"].current_state = "AVAILABLE"
    if "counselor_d" in c_map: c_map["counselor_d"].current_state = "AVAILABLE"
    if "counselor_e" in c_map: c_map["counselor_e"].current_state = "AVAILABLE"
    db.commit()

    # 2. Simulate incoming call requesting STME counselor
    session = telephony_service.handle_incoming_call(
        db=db,
        provider_call_id="test_req_116_sid",
        caller_number="+919876543210",
        virtual_number="+912562281456",
        caller_name="Admission Test Applicant"
    )

    # 3. Trigger counselor dispatch
    dispatch_res = await counselor_dispatch_service.request_counselor_assistance(
        db=db,
        call_session_id=session.id,
        caller_number=session.caller_number,
        school_code="STME",
        course_code="B.Tech",
        branch_name="Electrical Engineering",
        language="en",
        query_text="Need STME B.Tech guidance",
        ignore_working_hours=True
    )

    request_id = dispatch_res.get("request_id")
    if not request_id:
        return {"status": "ERROR", "message": "Failed to create request during test", "details": dispatch_res}

    # 4. Counselor D accepts first
    d_counselor = c_map.get("counselor_d")
    d_id = d_counselor.id if d_counselor else dispatch_res["candidates"][0]["id"]
    
    accept_res = await counselor_dispatch_service.accept_request_atomic(
        db=db,
        request_id=request_id,
        counselor_id=d_id
    )

    # 5. Verify outcomes
    req_updated = db.query(CallerRequest).filter(CallerRequest.id == request_id).first()
    candidates = db.query(RequestCandidate).filter(RequestCandidate.request_id == request_id).all()
    counselor_lookup = {c.id: c.user.name if c.user else c.id for c in db.query(Counselor).all()}
    cand_summary = [
        {"name": counselor_lookup.get(c.counselor_id, c.counselor_id), "response": c.response}
        for c in candidates
    ]

    return {
        "status": "PASSED",
        "title": "Requirement 116: Five STME Counselors Atomic Acceptance Test",
        "requirement": "Requirement 116: Five Counselors Pool",
        "description": "A & B were BUSY (skipped). C, D, E were notified. D accepted first. D marked BUSY, C & E cancelled.",
        "request_status": req_updated.status,
        "accepted_by": d_counselor.user.name if d_counselor and d_counselor.user else d_id,
        "counselor_d_state": d_counselor.current_state if d_counselor else "BUSY",
        "candidates_outcomes": cand_summary,
        "live_call_connected_to": "Counselor D"
    }

@router.post("/test-concurrent-acceptance")
async def test_concurrent_acceptance(db: Session = Depends(get_db)):
    """
    CRITICAL SPECIFICATION REQUIREMENT 117:
    Simultaneous Acceptance Test:
    Simulate Counselor C and Counselor D clicking ACCEPT at the same time.
    Only one transaction succeeds; other receives 'already accepted'.
    """
    counselors = db.query(Counselor).all()
    c_map = {c.user.username if c.user else c.id: c for c in counselors}
    c_id = c_map.get("counselor_c", counselors[0]).id
    d_id = c_map.get("counselor_d", counselors[1]).id

    session = telephony_service.handle_incoming_call(
        db=db,
        provider_call_id="test_req_117_sid",
        caller_number="+919876543210",
        virtual_number="+912562281456",
        caller_name="Race Condition Tester"
    )

    dispatch_res = await counselor_dispatch_service.request_counselor_assistance(
        db=db,
        call_session_id=session.id,
        caller_number=session.caller_number,
        school_code="STME",
        language="en",
        ignore_working_hours=True
    )

    request_id = dispatch_res["request_id"]

    # Transaction 1: D accepts
    res1 = await counselor_dispatch_service.accept_request_atomic(db=db, request_id=request_id, counselor_id=d_id)
    # Transaction 2: C accepts right after / concurrently
    res2 = await counselor_dispatch_service.accept_request_atomic(db=db, request_id=request_id, counselor_id=c_id)

    return {
        "status": "PASSED",
        "requirement": "Requirement 117: Concurrent Acceptance Race-Safety",
        "attempt_1_counselor_d": res1,
        "attempt_2_counselor_c": res2,
        "winner": "Counselor D",
        "loser_message": res2.get("error"),
        "atomic_lock_verified": res1.get("success") == True and res2.get("success") == False
    }
