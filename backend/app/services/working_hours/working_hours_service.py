from datetime import datetime, time
import zoneinfo
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import WorkingHours, Holiday, SpecialSchedule
from app.core.config import settings

class WorkingHoursService:
    @staticmethod
    def get_kolkata_now() -> datetime:
        try:
            tz = zoneinfo.ZoneInfo(settings.TIMEZONE)
            return datetime.now(tz)
        except Exception:
            return datetime.now()

    @classmethod
    def check_working_hours(cls, db: Session) -> Dict[str, Any]:
        """
        Check if university is currently open based on holidays, special schedules, and weekly hours.
        Timezone: Asia/Kolkata
        """
        now = cls.get_kolkata_now()
        date_str = now.strftime("%Y-%m-%d")
        current_time_str = now.strftime("%H:%M")
        day_of_week = now.weekday() # 0 = Monday, 6 = Sunday

        # 1. Check Holidays
        holiday = db.query(Holiday).filter(Holiday.date == date_str, Holiday.is_closed == True).first()
        if holiday:
            return {
                "open": False,
                "reason": f"holiday: {holiday.name}",
                "message": f"University is closed today for {holiday.name}."
            }

        # 2. Check Special Schedule
        special = db.query(SpecialSchedule).filter(SpecialSchedule.date == date_str).first()
        if special:
            if special.is_closed:
                return {
                    "open": False,
                    "reason": "special_closure",
                    "message": f"Special university closure: {special.reason or 'Scheduled holiday'}"
                }
            if special.start_time <= current_time_str <= special.end_time:
                return {
                    "open": True,
                    "reason": "special_schedule",
                    "message": "University is currently open under special schedule."
                }
            else:
                return {
                    "open": False,
                    "reason": "outside_special_hours",
                    "message": f"Outside special hours ({special.start_time} - {special.end_time})."
                }

        # 3. Check Regular Working Hours for today
        schedule = db.query(WorkingHours).filter(
            WorkingHours.day_of_week == day_of_week,
            WorkingHours.active == True
        ).first()

        if not schedule or schedule.is_closed:
            return {
                "open": False,
                "reason": "weekend_or_closed_day",
                "message": "University admissions office is closed today."
            }

        if schedule.start_time <= current_time_str <= schedule.end_time:
            return {
                "open": True,
                "reason": "normal_schedule",
                "message": f"University is open ({schedule.start_time} to {schedule.end_time} IST)."
            }
        else:
            return {
                "open": False,
                "reason": "outside_hours",
                "message": f"Outside normal hours ({schedule.start_time} to {schedule.end_time} IST)."
            }

working_hours_service = WorkingHoursService()
