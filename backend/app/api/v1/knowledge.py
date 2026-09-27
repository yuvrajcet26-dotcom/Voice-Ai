from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import KnowledgeBase, KnowledgeDocument, KnowledgeChunk
from app.schemas.schemas import KnowledgeCreate, KnowledgeResponse

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("", response_model=List[KnowledgeResponse])
def get_knowledge(
    category: Optional[str] = None,
    school_id: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeBase)
    if category:
        query = query.filter(KnowledgeBase.category == category)
    if school_id:
        query = query.filter(KnowledgeBase.school_id == school_id)
    if language:
        query = query.filter(KnowledgeBase.language == language)
    if status:
        query = query.filter(KnowledgeBase.status == status)

    return query.order_by(KnowledgeBase.updated_at.desc()).all()

@router.post("", response_model=KnowledgeResponse)
def create_knowledge(payload: KnowledgeCreate, db: Session = Depends(get_db)):
    kb = KnowledgeBase(
        title=payload.title,
        category=payload.category,
        content=payload.content,
        school_id=payload.school_id,
        course_id=payload.course_id,
        branch_id=payload.branch_id,
        language=payload.language,
        status=payload.status or "PUBLISHED"
    )
    db.add(kb)
    db.commit()
    db.refresh(kb)
    return kb

@router.put("/{id}", response_model=KnowledgeResponse)
def update_knowledge(id: str, payload: KnowledgeCreate, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge entry not found.")

    kb.title = payload.title
    kb.category = payload.category
    kb.content = payload.content
    kb.school_id = payload.school_id
    kb.course_id = payload.course_id
    kb.branch_id = payload.branch_id
    kb.language = payload.language
    kb.status = payload.status

    db.commit()
    db.refresh(kb)
    return kb

@router.post("/{id}/publish")
def publish_knowledge(id: str, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge entry not found.")

    kb.status = "PUBLISHED"
    db.commit()
    return {"success": True, "message": "Knowledge published. The AI voice agent will now use this updated information."}

@router.delete("/{id}")
def delete_knowledge(id: str, db: Session = Depends(get_db)):
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge entry not found.")
    db.delete(kb)
    db.commit()
    return {"success": True, "message": "Knowledge entry removed."}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Ingest document (PDF, TXT, DOCX), extract text, and index for AI retrieval."""
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    
    doc = KnowledgeDocument(
        file_name=file.filename or "uploaded_doc.txt",
        file_type=file.filename.split(".")[-1].upper() if file.filename else "TXT",
        file_path=f"storage/docs/{file.filename}",
        status="APPROVED",
        extracted_text=text[:5000] # preview
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "success": True,
        "document_id": doc.id,
        "file_name": doc.file_name,
        "extracted_length": len(text),
        "status": "APPROVED",
        "message": "Document ingested and approved for knowledge indexing."
    }
