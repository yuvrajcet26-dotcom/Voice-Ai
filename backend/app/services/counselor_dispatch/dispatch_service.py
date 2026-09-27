import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.models import (
    Counselor, CounselorAssignment, CallerRequest, RequestCandidate,
    RequestAcceptance, CallSession, CallEvent, CallbackRequest, School, User
)
from app.services.working_hours.working_hours_service import working_hours_service
from app.services.notifications.notification_service import notification_service
from app.services.websocket_manager import ws_manager
from app.core.config import settings

logger = logging.getLogger("counselor_dispatch")

class CounselorDispatchService:
    """
    Intelligent Counselor Routing & First-Acceptance Lock Engine.
    Implements:
    - Working hours validation
    - School-specific counselor pool resolution
    - Real-time availability filter
    - First-Acceptance atomic locking (concurrency-safe)
    - Timeout and failure failovers (Callback request generation)
    """

    @classmethod
    async def request_counselor_assistance(
        cls,
        db: Session,
        call_session_id: str,
        caller_number: str,
        school_code: Optional[str] = None,
        course_code: Optional[str] = None,
        branch_name: Optional[str] = None,
        language: str = "en",
        query_text: Optional[str] = None,
        ignore_working_hours: bool = False
    ) -> Dict[str, Any]:
        """
        Step 1: Check working hours
        Step 2: Find assigned counselors for school
        Step 3: Filter active & available counselors
        Step 4: Notify candidate counselors
        """
        call = db.query(CallSession).filter(CallSession.id == call_session_id).first()
        if not call:
            return {"status": "ERROR", "message": "Call session not found."}

        # 1. Working Hours Check
        hours_status = working_hours_service.check_working_hours(db)
        if not hours_status["open"] and not ignore_working_hours:
            # Outside working hours: Log event and create callback option
            event = CallEvent(
                call_session_id=call.id,
                event_type="OUTSIDE_HOURS_CHECK",
                details=f"Call outside hours: {hours_status['reason']}"
            )
            db.add(event)
            db.commit()

            callback = cls.create_callback_request(
                db=db,
                call_id=call.id,
                caller_number=caller_number,
                language=language,
                query=query_text or "Counselor assistance requested outside working hours."
            )

            return {
                "status": "OUTSIDE_HOURS",
                "message": hours_status["message"],
                "callback_id": callback.id,
                "reason": hours_status["reason"]
            }

        # 2. Resolve School
        school = None
        if school_code:
            school = db.query(School).filter(
                or_(School.code.ilike(school_code), School.short_name.ilike(school_code))
            ).first()
        if not school:
            # Fallback to default STME if not identified
            school = db.query(School).filter(School.code == "STME").first()

        school_id = school.id if school else None

        # 3. Find Assigned Counselors
        query = db.query(Counselor).join(CounselorAssignment, Counselor.id == CounselorAssignment.counselor_id)
        if school_id:
            query = query.filter(CounselorAssignment.school_id == school_id, CounselorAssignment.active == True)
        
        assigned_counselors = query.filter(Counselor.status == "ACTIVE").all()

        if not assigned_counselors:
            # Fallback to any active counselor
            assigned_counselors = db.query(Counselor).filter(Counselor.status == "ACTIVE").all()

        # 4. Filter Available Counselors
        available_counselors = [c for c in assigned_counselors if c.current_state == "AVAILABLE"]

        # If all counselors are busy
        if not available_counselors:
            event = CallEvent(
                call_session_id=call.id,
                event_type="ALL_COUNSELORS_BUSY",
                details="All school counselors are currently busy or offline."
            )
            db.add(event)
            db.commit()

            callback = cls.create_callback_request(
                db=db,
                call_id=call.id,
                caller_number=caller_number,
                school_id=school_id,
                language=language,
                query=query_text or "All counselors busy, callback requested."
            )

            return {
                "status": "ALL_BUSY",
                "message": "All counselors are currently assisting other callers. We can schedule a priority callback.",
                "callback_id": callback.id,
                "total_assigned": len(assigned_counselors)
            }

        # 5. Create CallerRequest
        request = CallerRequest(
            call_session_id=call.id,
            caller_number=caller_number,
            caller_name=call.caller_name or "Admission Inquirer",
            language=language,
            school_id=school_id,
            query=query_text,
            status="WAITING_FOR_ACCEPTANCE"
        )
        db.add(request)
        db.commit()
        db.refresh(request)

        # Update Call status
        call.status = "WAITING_FOR_COUNSELOR"
        call.counselor_requested = True
        
        event = CallEvent(
            call_session_id=call.id,
            event_type="COUNSELOR_REQUESTED",
            details=f"Notifying {len(available_counselors)} available counselors for {school.name if school else 'University'}."
        )
        db.add(event)
        db.commit()

        # 6. Create Candidates and Dispatch Multi-Channel Notifications
        candidate_ids = []
        for counselor in available_counselors:
            candidate = RequestCandidate(
                request_id=request.id,
                counselor_id=counselor.id,
                eligibility_status="ELIGIBLE",
                notification_status="SENT",
                response="PENDING"
            )
            db.add(candidate)
            candidate_ids.append(counselor.id)

        db.commit()

        # Dispatch real notifications
        for counselor in available_counselors:
            await notification_service.dispatch_counselor_notification(
                db=db,
                counselor=counselor,
                request_data={
                    "request_id": request.id,
                    "call_id": call.id,
                    "caller_number": caller_number,
                    "school": school.short_name if school else "STME",
                    "course": course_code or "B.Tech",
                    "branch": branch_name or "General",
                    "language": language
                }
            )

        return {
            "status": "NOTIFIED",
            "request_id": request.id,
            "candidates_count": len(available_counselors),
            "candidates": [{"id": c.id, "email": c.email, "phone": c.phone_number} for c in available_counselors],
            "timeout_seconds": settings.COUNSELOR_ACCEPTANCE_TIMEOUT_SECONDS
        }

    @classmethod
    async def accept_request_atomic(
        cls,
        db: Session,
        request_id: str,
        counselor_id: str
    ) -> Dict[str, Any]:
        """
        ATOMIC FIRST-ACCEPTANCE LOCK ALGORITHM:
        Ensures that if multiple counselors attempt to accept simultaneously,
        exactly ONE succeeds and the others are rejected gracefully.
        """
        # Lock and retrieve the request
        request = db.query(CallerRequest).filter(CallerRequest.id == request_id).with_for_update().first() if db.bind.dialect.name != 'sqlite' else db.query(CallerRequest).filter(CallerRequest.id == request_id).first()
        
        if not request:
            return {"success": False, "error": "Request not found."}

        # Check call session status
        call = db.query(CallSession).filter(CallSession.id == request.call_session_id).first()
        if not call or call.status in ["DISCONNECTED", "COMPLETED", "FAILED"]:
            return {"success": False, "error": "This call is no longer active. Caller has disconnected."}

        # Check if already accepted
        if request.status != "WAITING_FOR_ACCEPTANCE":
            return {
                "success": False,
                "error": "Request already accepted by another counselor.",
                "already_accepted_by": request.accepted_by
            }

        # ATOMIC LOCK SUCCEEDED FOR THIS COUNSELOR
        now = datetime.now(timezone.utc)
        request.status = "ACCEPTED"
        request.accepted_by = counselor_id
        request.accepted_at = now

        # Update candidate records
        candidates = db.query(RequestCandidate).filter(RequestCandidate.request_id == request.id).all()
        for cand in candidates:
            if cand.counselor_id == counselor_id:
                cand.response = "ACCEPTED"
                cand.responded_at = now
            else:
                cand.response = "CANCELLED"
                cand.responded_at = now

        # Update Counselor Availability to BUSY
        counselor = db.query(Counselor).filter(Counselor.id == counselor_id).first()
        if counselor:
            counselor.current_state = "BUSY"

        # Record RequestAcceptance
        acceptance = RequestAcceptance(
            request_id=request.id,
            counselor_id=counselor_id,
            accepted_at=now,
            transfer_started_at=now,
            status="CONNECTED"
        )
        db.add(acceptance)

        # Update Call Session state
        call.status = "COUNSELOR_CONNECTED"
        event = CallEvent(
            call_session_id=call.id,
            event_type="COUNSELOR_ACCEPTED",
            details=f"Accepted by Counselor {counselor.user.name if counselor and counselor.user else counselor_id}. Call transferred."
        )
        db.add(event)
        db.commit()

        # Broadcast update to notify all dashboards and counselors
        counselor_name = counselor.user.name if counselor and counselor.user else "Counselor"
        await ws_manager.broadcast_to_dashboards("REQUEST_ACCEPTED", {
            "request_id": request.id,
            "counselor_id": counselor_id,
            "counselor_name": counselor_name,
            "call_id": call.id
        })

        # Cancel alerts on other counselors' dashboards
        for cand in candidates:
            if cand.counselor_id != counselor_id:
                await ws_manager.send_to_counselor(cand.counselor_id, "REQUEST_CANCELLED", {
                    "request_id": request.id,
                    "reason": f"Accepted by {counselor_name}"
                })

        return {
            "success": True,
            "message": "Call transfer connected successfully.",
            "request_id": request.id,
            "call_id": call.id,
            "counselor_id": counselor_id,
            "counselor_name": counselor_name,
            "status": "COUNSELOR_CONNECTED"
        }

    @classmethod
    def decline_request(cls, db: Session, request_id: str, counselor_id: str, reason: Optional[str] = None) -> Dict[str, Any]:
        """Record counselor declining a request."""
        cand = db.query(RequestCandidate).filter(
            RequestCandidate.request_id == request_id,
            RequestCandidate.counselor_id == counselor_id
        ).first()
        if cand:
            cand.response = "DECLINED"
            cand.responded_at = datetime.now(timezone.utc)
            db.commit()
            return {"success": True, "message": "Request declined."}
        return {"success": False, "error": "Candidate record not found."}

    @classmethod
    def release_counselor(cls, db: Session, counselor_id: str):
        """Release counselor back to AVAILABLE after call completion."""
        counselor = db.query(Counselor).filter(Counselor.id == counselor_id).first()
        if counselor:
            counselor.current_state = "AVAILABLE"
            db.commit()
            logger.info(f"Counselor {counselor_id} marked AVAILABLE.")

    @classmethod
    def create_callback_request(
        cls,
        db: Session,
        caller_number: str,
        call_id: Optional[str] = None,
        caller_name: Optional[str] = "Student",
        language: str = "en",
        school_id: Optional[str] = None,
        query: Optional[str] = None,
        preferred_time: Optional[str] = None
    ) -> CallbackRequest:
        """Create a persistent callback request for human counselor follow-up."""
        cb = CallbackRequest(
            call_id=call_id,
            caller_number=caller_number,
            caller_name=caller_name,
            language=language,
            school_id=school_id,
            query=query,
            preferred_callback_time=preferred_time,
            status="PENDING"
        )
        db.add(cb)
        db.commit()
        db.refresh(cb)
        return cb

counselor_dispatch_service = CounselorDispatchService()
