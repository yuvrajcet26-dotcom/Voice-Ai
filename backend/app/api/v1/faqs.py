from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import FAQ
from app.schemas.schemas import FAQCreate, FAQResponse

router = APIRouter(prefix="/faqs", tags=["FAQs"])

@router.get("", response_model=List[FAQResponse])
def get_faqs(
    language: Optional[str] = None,
    school_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FAQ)
    if language:
        query = query.filter(FAQ.language == language)
    if school_id:
        query = query.filter(FAQ.school_id == school_id)
    if category:
        query = query.filter(FAQ.category == category)
    return query.order_by(FAQ.created_at.desc()).all()

@router.post("", response_model=FAQResponse)
def create_faq(payload: FAQCreate, db: Session = Depends(get_db)):
    faq = FAQ(
        question=payload.question,
        answer=payload.answer,
        language=payload.language,
        school_id=payload.school_id,
        course_id=payload.course_id,
        branch_id=payload.branch_id,
        category=payload.category,
        status="PUBLISHED"
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq

@router.put("/{id}", response_model=FAQResponse)
def update_faq(id: str, payload: FAQCreate, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(FAQ.id == id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found.")

    faq.question = payload.question
    faq.answer = payload.answer
    faq.language = payload.language
    faq.school_id = payload.school_id
    faq.course_id = payload.course_id
    faq.branch_id = payload.branch_id
    faq.category = payload.category
    faq.status = payload.status

    db.commit()
    db.refresh(faq)
    return faq

@router.delete("/{id}")
def delete_faq(id: str, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(FAQ.id == id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found.")
    db.delete(faq)
    db.commit()
    return {"success": True, "message": "FAQ deleted."}
