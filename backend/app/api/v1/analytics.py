from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(
    school_id: Optional[str] = None,
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    metrics = analytics_service.get_dashboard_metrics(db)
    return metrics
