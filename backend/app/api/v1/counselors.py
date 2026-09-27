from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Counselor, CounselorAssignment, User, School, Course, Branch, AuditLog
from app.schemas.schemas import CounselorResponse, CounselorAvailabilityUpdate, CounselorAssignmentCreate
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/counselors", tags=["Counselors"])

@router.get("")
def get_counselors(
    school_id: Optional[str] = None,
    current_state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Counselor)
    if current_state:
        query = query.filter(Counselor.current_state == current_state)

    counselors = query.all()
    results = []
    for c in counselors:
        user = c.user
        assignments = []
        for a in c.assignments:
            if school_id and a.school_id != school_id:
                continue
            assignments.append({
                "id": a.id,
                "school_id": a.school_id,
                "school_code": a.school.code if a.school else None,
                "school_name": a.school.name if a.school else None,
                "course_id": a.course_id,
                "branch_id": a.branch_id,
                "priority": a.priority,
                "active": a.active
            })

        if school_id and not assignments:
            continue

        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "name": user.name if user else "Counselor",
            "email": c.email,
            "phone_number": c.phone_number,
            "designation": c.designation,
            "status": c.status,
            "current_state": c.current_state,
            "assignments": assignments
        })

    return results

@router.get("/{id}")
def get_counselor(id: str, db: Session = Depends(get_db)):
    c = db.query(Counselor).filter(Counselor.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Counselor not found.")
    
    user = c.user
    assignments = [
        {
            "id": a.id,
            "school_id": a.school_id,
            "school_code": a.school.code if a.school else None,
            "course_id": a.course_id,
            "branch_id": a.branch_id,
            "priority": a.priority,
            "active": a.active
        }
        for a in c.assignments
    ]

    return {
        "id": c.id,
        "user_id": c.user_id,
        "name": user.name if user else "Counselor",
        "email": c.email,
        "phone_number": c.phone_number,
        "designation": c.designation,
        "status": c.status,
        "current_state": c.current_state,
        "assignments": assignments
    }

@router.put("/{id}/availability")
async def update_counselor_availability(
    id: str,
    payload: CounselorAvailabilityUpdate,
    db: Session = Depends(get_db)
):
    counselor = db.query(Counselor).filter(Counselor.id == id).first()
    if not counselor:
        raise HTTPException(status_code=404, detail="Counselor not found.")

    valid_states = ["AVAILABLE", "BUSY", "OFFLINE", "ON_BREAK", "DO_NOT_DISTURB"]
    if payload.current_state not in valid_states:
        raise HTTPException(status_code=400, detail=f"Invalid state. Must be one of {valid_states}")

    old_state = counselor.current_state
    counselor.current_state = payload.current_state
    db.commit()

    # Broadcast status change to dashboards
    await ws_manager.broadcast_to_dashboards("COUNSELOR_STATUS_CHANGED", {
        "counselor_id": counselor.id,
        "name": counselor.user.name if counselor.user else "Counselor",
        "old_state": old_state,
        "new_state": counselor.current_state
    })

    return {
        "id": counselor.id,
        "current_state": counselor.current_state,
        "message": f"Counselor availability updated to {counselor.current_state}."
    }

@router.post("/{id}/assignments")
def add_counselor_assignment(
    id: str,
    payload: CounselorAssignmentCreate,
    db: Session = Depends(get_db)
):
    counselor = db.query(Counselor).filter(Counselor.id == id).first()
    if not counselor:
        raise HTTPException(status_code=404, detail="Counselor not found.")

    assignment = CounselorAssignment(
        counselor_id=counselor.id,
        school_id=payload.school_id,
        course_id=payload.course_id,
        branch_id=payload.branch_id,
        priority=payload.priority,
        active=True
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return {"success": True, "assignment_id": assignment.id}
