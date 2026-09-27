from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Branch, Course
from app.schemas.schemas import BranchCreate, BranchUpdate, BranchResponse

router = APIRouter(prefix="/branches", tags=["Branches"])

@router.get("", response_model=List[BranchResponse])
def get_branches(
    course_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Branch)
    if course_id:
        query = query.filter(Branch.course_id == course_id)
    return query.order_by(Branch.name.asc()).all()

@router.post("", response_model=BranchResponse)
def create_branch(payload: BranchCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == payload.course_id).first()
    if not course:
        raise HTTPException(status_code=400, detail="Associated Course does not exist.")

    branch = Branch(
        course_id=payload.course_id,
        name=payload.name,
        code=payload.code.upper(),
        description=payload.description,
        eligibility=payload.eligibility,
        intake=payload.intake,
        fees=payload.fees,
        duration=payload.duration,
        facilities=payload.facilities,
        placement_info=payload.placement_info,
        status="PUBLISHED"
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch

@router.get("/{id}", response_model=BranchResponse)
def get_branch(id: str, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found.")
    return branch

@router.put("/{id}", response_model=BranchResponse)
def update_branch(id: str, payload: BranchUpdate, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found.")

    for k, v in payload.dict(exclude_unset=True).items():
        setattr(branch, k, v)

    db.commit()
    db.refresh(branch)
    return branch

@router.delete("/{id}")
def delete_branch(id: str, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found.")
    db.delete(branch)
    db.commit()
    return {"success": True, "message": "Branch deleted successfully."}
