from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import WorkingHours, Holiday, SpecialSchedule
from app.schemas.schemas import WorkingHoursUpdate, HolidayCreate, HolidayResponse
from app.services.working_hours.working_hours_service import working_hours_service

router = APIRouter(prefix="/working-hours", tags=["Working Hours"])

@router.get("")
def get_working_hours(db: Session = Depends(get_db)):
    hours = db.query(WorkingHours).order_by(WorkingHours.day_of_week.asc()).all()
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return [
        {
            "id": h.id,
            "day_of_week": h.day_of_week,
            "day_name": day_names[h.day_of_week] if 0 <= h.day_of_week <= 6 else "Unknown",
            "start_time": h.start_time,
            "end_time": h.end_time,
            "is_closed": h.is_closed,
            "timezone": h.timezone,
            "active": h.active
        }
        for h in hours
    ]

@router.put("")
def update_working_hours(items: List[WorkingHoursUpdate], db: Session = Depends(get_db)):
    for item in items:
        h = db.query(WorkingHours).filter(WorkingHours.day_of_week == item.day_of_week).first()
        if h:
            h.start_time = item.start_time
            h.end_time = item.end_time
            h.is_closed = item.is_closed

    db.commit()
    return {"success": True, "message": "Working hours updated successfully."}

@router.get("/status")
def get_live_status(db: Session = Depends(get_db)):
    """Check if the university is open right now in Asia/Kolkata."""
    status = working_hours_service.check_working_hours(db)
    now = working_hours_service.get_kolkata_now()
    return {
        "current_time_ist": now.strftime("%Y-%m-%d %H:%M:%S %Z"),
        "timezone": "Asia/Kolkata",
        **status
    }

@router.get("/holidays", response_model=List[HolidayResponse])
def get_holidays(db: Session = Depends(get_db)):
    return db.query(Holiday).order_by(Holiday.date.asc()).all()

@router.post("/holidays", response_model=HolidayResponse)
def add_holiday(payload: HolidayCreate, db: Session = Depends(get_db)):
    holiday = Holiday(
        name=payload.name,
        date=payload.date,
        description=payload.description,
        is_closed=payload.is_closed
    )
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday

@router.delete("/holidays/{id}")
def delete_holiday(id: str, db: Session = Depends(get_db)):
    holiday = db.query(Holiday).filter(Holiday.id == id).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found.")
    db.delete(holiday)
    db.commit()
    return {"success": True, "message": "Holiday deleted."}
