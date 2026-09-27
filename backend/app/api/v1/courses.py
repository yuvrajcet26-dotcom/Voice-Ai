from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Course, School
from app.schemas.schemas import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseResponse])
def get_courses(
    school_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if school_id:
        query = query.filter(Course.school_id == school_id)
    if status:
        query = query.filter(Course.status == status)
    return query.order_by(Course.name.asc()).all()

@router.post("", response_model=CourseResponse)
def create_course(payload: CourseCreate, db: Session = Depends(get_db)):
    school = db.query(School).filter(School.id == payload.school_id).first()
    if not school:
        raise HTTPException(status_code=400, detail="Associated School does not exist.")

    course = Course(
        school_id=payload.school_id,
        name=payload.name,
        code=payload.code.upper(),
        description=payload.description,
        eligibility=payload.eligibility,
        duration=payload.duration,
        intake=payload.intake,
        fees=payload.fees,
        admission_process=payload.admission_process,
        status="PUBLISHED"
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/{id}", response_model=CourseResponse)
def get_course(id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    return course

@router.put("/{id}", response_model=CourseResponse)
def update_course(id: str, payload: CourseUpdate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(course, k, v)

    db.commit()
    db.refresh(course)
    return course

@router.delete("/{id}")
def delete_course(id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    db.delete(course)
    db.commit()
    return {"success": True, "message": "Course deleted successfully."}
