from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import CallerRequest, RequestCandidate, Counselor, CallSession
from app.schemas.schemas import RequestAcceptPayload, RequestDeclinePayload
from app.services.counselor_dispatch.dispatch_service import counselor_dispatch_service

router = APIRouter(prefix="/requests", tags=["Requests"])

@router.get("")
def get_requests(
    counselor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CallerRequest)
    if status:
        query = query.filter(CallerRequest.status == status)

    requests = query.order_by(CallerRequest.created_at.desc()).limit(100).all()
    results = []

    for r in requests:
        candidates = []
        for c in r.candidates:
            counselor = db.query(Counselor).filter(Counselor.id == c.counselor_id).first()
            candidates.append({
                "counselor_id": c.counselor_id,
                "counselor_name": counselor.user.name if counselor and counselor.user else "Counselor",
                "response": c.response,
                "notified_at": c.notified_at
            })

        # Filter for counselor specific view if requested
        if counselor_id:
            cand_match = any(c["counselor_id"] == counselor_id for c in candidates)
            if not cand_match and r.accepted_by != counselor_id:
                continue

        accepted_by_name = None
        if r.accepted_by:
            ac = db.query(Counselor).filter(Counselor.id == r.accepted_by).first()
            if ac and ac.user:
                accepted_by_name = ac.user.name

        results.append({
            "id": r.id,
            "call_session_id": r.call_session_id,
            "caller_number": r.caller_number,
            "caller_name": r.caller_name,
            "language": r.language,
            "school_id": r.school_id,
            "course_id": r.course_id,
            "branch_id": r.branch_id,
            "query": r.query,
            "status": r.status,
            "accepted_by": r.accepted_by,
            "accepted_by_name": accepted_by_name,
            "created_at": r.created_at,
            "accepted_at": r.accepted_at,
            "candidates": candidates
        })

    return results

@router.get("/{id}")
def get_request(id: str, db: Session = Depends(get_db)):
    r = db.query(CallerRequest).filter(CallerRequest.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found.")

    candidates = []
    for c in r.candidates:
        counselor = db.query(Counselor).filter(Counselor.id == c.counselor_id).first()
        candidates.append({
            "counselor_id": c.counselor_id,
            "counselor_name": counselor.user.name if counselor and counselor.user else "Counselor",
            "response": c.response,
            "notified_at": c.notified_at
        })

    return {
        "id": r.id,
        "call_session_id": r.call_session_id,
        "caller_number": r.caller_number,
        "caller_name": r.caller_name,
        "language": r.language,
        "school_id": r.school_id,
        "course_id": r.course_id,
        "branch_id": r.branch_id,
        "query": r.query,
        "status": r.status,
        "accepted_by": r.accepted_by,
        "created_at": r.created_at,
        "accepted_at": r.accepted_at,
        "candidates": candidates
    }

@router.post("/{id}/accept")
async def accept_request(
    id: str,
    payload: RequestAcceptPayload,
    db: Session = Depends(get_db)
):
    """
    CRITICAL ENDPOINT: Atomic lock on request acceptance.
    """
    result = await counselor_dispatch_service.accept_request_atomic(
        db=db,
        request_id=id,
        counselor_id=payload.counselor_id
    )

    if not result.get("success"):
        raise HTTPException(status_code=409, detail=result.get("error", "Acceptance failed."))

    return result

@router.post("/{id}/decline")
def decline_request(
    id: str,
    payload: RequestDeclinePayload,
    db: Session = Depends(get_db)
):
    result = counselor_dispatch_service.decline_request(
        db=db,
        request_id=id,
        counselor_id=payload.counselor_id,
        reason=payload.reason
    )
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Decline failed."))
    return result
