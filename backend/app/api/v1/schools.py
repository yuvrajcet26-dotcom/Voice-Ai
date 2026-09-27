from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import School, SchoolInformation, AuditLog
from app.schemas.schemas import SchoolCreate, SchoolUpdate, SchoolResponse

router = APIRouter(prefix="/schools", tags=["Schools"])

@router.get("", response_model=List[SchoolResponse])
def get_schools(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(School)
    if status:
        query = query.filter(School.status == status)
    return query.order_by(School.created_at.desc()).all()

@router.post("", response_model=SchoolResponse)
def create_school(payload: SchoolCreate, db: Session = Depends(get_db)):
    # Check duplicate code
    existing = db.query(School).filter(School.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="School code already exists.")

    school = School(
        name=payload.name,
        code=payload.code.upper(),
        short_name=payload.short_name,
        description=payload.description,
        head_name=payload.head_name,
        email=payload.email,
        phone=payload.phone,
        website=payload.website,
        address=payload.address,
        status="PUBLISHED"
    )
    db.add(school)
    db.commit()
    db.refresh(school)

    # Audit log
    audit = AuditLog(
        action="CREATE_SCHOOL",
        entity_type="School",
        entity_id=school.id,
        new_value=school.name
    )
    db.add(audit)
    db.commit()

    return school

@router.get("/{id}", response_model=SchoolResponse)
def get_school(id: str, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")
    return school

@router.put("/{id}", response_model=SchoolResponse)
def update_school(id: str, payload: SchoolUpdate, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(school, key, value)

    db.commit()
    db.refresh(school)
    return school

@router.post("/{id}/publish")
def publish_school(id: str, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")

    school.status = "PUBLISHED"
    db.commit()
    return {"success": True, "message": f"{school.name} published successfully for AI and calls."}

@router.delete("/{id}")
def delete_school(id: str, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")

    school.status = "ARCHIVED"
    db.commit()
    return {"success": True, "message": "School archived successfully."}
