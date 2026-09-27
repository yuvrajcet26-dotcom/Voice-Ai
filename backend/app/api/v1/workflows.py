from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Workflow
from app.schemas.schemas import WorkflowResponse, WorkflowSaveRequest

router = APIRouter(prefix="/workflows", tags=["Workflows"])

@router.get("", response_model=List[WorkflowResponse])
def get_workflows(db: Session = Depends(get_db)):
    return db.query(Workflow).order_by(Workflow.updated_at.desc()).all()

@router.get("/active", response_model=WorkflowResponse)
def get_active_workflow(db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.status == "PUBLISHED").first()
    if not wf:
        wf = db.query(Workflow).first()
    if not wf:
        raise HTTPException(status_code=404, detail="No workflow configured.")
    return wf

@router.get("/{id}", response_model=WorkflowResponse)
def get_workflow(id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")
    return wf

@router.post("", response_model=WorkflowResponse)
def save_workflow(payload: WorkflowSaveRequest, db: Session = Depends(get_db)):
    # Check if a workflow with this name exists, or create new version
    wf = db.query(Workflow).filter(Workflow.name == payload.name).first()
    if not wf:
        wf = Workflow(
            name=payload.name,
            description=payload.description,
            nodes_json=payload.nodes_json,
            edges_json=payload.edges_json,
            status=payload.status,
            version=1
        )
        db.add(wf)
    else:
        wf.description = payload.description
        wf.nodes_json = payload.nodes_json
        wf.edges_json = payload.edges_json
        wf.status = payload.status
        wf.version = (wf.version or 1) + 1

    db.commit()
    db.refresh(wf)
    return wf

@router.post("/{id}/publish")
def publish_workflow(id: str, db: Session = Depends(get_db)):
    wf = db.query(Workflow).filter(Workflow.id == id).first()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found.")

    # Mark others as ARCHIVED
    db.query(Workflow).filter(Workflow.id != id, Workflow.status == "PUBLISHED").update({"status": "ARCHIVED"})
    wf.status = "PUBLISHED"
    db.commit()
    return {"success": True, "message": f"Workflow {wf.name} v{wf.version} is now active for live callers."}
