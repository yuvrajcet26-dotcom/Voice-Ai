import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(30), default="COUNSELOR")  # MAIN_ADMIN, REGISTRAR, COUNSELOR
    status = Column(String(20), default="ACTIVE")    # ACTIVE, INACTIVE, SUSPENDED
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    counselor_profile = relationship("Counselor", back_populates="user", uselist=False)

class School(Base):
    __tablename__ = "schools"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    short_name = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    head_name = Column(String(100), nullable=True)
    email = Column(String(120), nullable=True)
    phone = Column(String(30), nullable=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(20), default="PUBLISHED")  # DRAFT, REVIEW, APPROVED, PUBLISHED, ARCHIVED
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    courses = relationship("Course", back_populates="school", cascade="all, delete-orphan")
    counselor_assignments = relationship("CounselorAssignment", back_populates="school")
    information_items = relationship("SchoolInformation", back_populates="school", cascade="all, delete-orphan")

class SchoolInformation(Base):
    __tablename__ = "school_information"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    school_id = Column(String(36), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # Facilities, Admission, Eligibility, Fees, Scholarships, Placements, Hostel
    content = Column(Text, nullable=False)
    status = Column(String(20), default="PUBLISHED")
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    school = relationship("School", back_populates="information_items")

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    school_id = Column(String(36), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(30), nullable=False)
    description = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    duration = Column(String(50), nullable=True)
    intake = Column(Integer, default=60)
    fees = Column(String(100), nullable=True)
    admission_process = Column(Text, nullable=True)
    status = Column(String(20), default="PUBLISHED")  # DRAFT, REVIEW, APPROVED, PUBLISHED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    school = relationship("School", back_populates="courses")
    branches = relationship("Branch", back_populates="course", cascade="all, delete-orphan")

class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(30), nullable=False)
    description = Column(Text, nullable=True)
    eligibility = Column(Text, nullable=True)
    intake = Column(Integer, default=60)
    fees = Column(String(100), nullable=True)
    duration = Column(String(50), nullable=True)
    facilities = Column(Text, nullable=True)
    placement_info = Column(Text, nullable=True)
    status = Column(String(20), default="PUBLISHED")  # DRAFT, REVIEW, APPROVED, PUBLISHED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    course = relationship("Course", back_populates="branches")

class Counselor(Base):
    __tablename__ = "counselors"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(120), nullable=False)
    designation = Column(String(100), default="Admission Counselor")
    status = Column(String(20), default="ACTIVE") # ACTIVE, INACTIVE
    current_state = Column(String(30), default="AVAILABLE") # AVAILABLE, BUSY, OFFLINE, ON_BREAK, DO_NOT_DISTURB
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    
    user = relationship("User", back_populates="counselor_profile")
    assignments = relationship("CounselorAssignment", back_populates="counselor", cascade="all, delete-orphan")
    schedules = relationship("CounselorSchedule", back_populates="counselor", cascade="all, delete-orphan")

class CounselorAssignment(Base):
    __tablename__ = "counselor_assignments"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    counselor_id = Column(String(36), ForeignKey("counselors.id", ondelete="CASCADE"), nullable=False)
    school_id = Column(String(36), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    branch_id = Column(String(36), ForeignKey("branches.id", ondelete="SET NULL"), nullable=True)
    priority = Column(Integer, default=1)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    
    counselor = relationship("Counselor", back_populates="assignments")
    school = relationship("School", back_populates="counselor_assignments")

class CounselorSchedule(Base):
    __tablename__ = "counselor_schedules"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    counselor_id = Column(String(36), ForeignKey("counselors.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="17:30")
    active = Column(Boolean, default=True)
    
    counselor = relationship("Counselor", back_populates="schedules")

class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False) # University, School, Course, Branch, Admission, Eligibility, Fees, Facilities, Hostel, Scholarships, Placements, Campus, FAQs, Contact
    content = Column(Text, nullable=False)
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    branch_id = Column(String(36), nullable=True)
    language = Column(String(20), default="en") # en, hi, mr
    status = Column(String(20), default="PUBLISHED") # DRAFT, REVIEW, APPROVED, PUBLISHED
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False) # PDF, DOCX, TXT
    file_path = Column(String(500), nullable=False)
    status = Column(String(20), default="APPROVED") # UPLOADED, EXTRACTED, CLEANED, REVIEW, APPROVED, PUBLISHED
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=utc_now)

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    doc_id = Column(String(36), nullable=True)
    kb_id = Column(String(36), nullable=True)
    chunk_text = Column(Text, nullable=False)
    keywords = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(20), default="en") # en, hi, mr
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    branch_id = Column(String(36), nullable=True)
    category = Column(String(50), default="General")
    status = Column(String(20), default="PUBLISHED")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="PUBLISHED") # DRAFT, TESTING, PUBLISHED, ARCHIVED
    version = Column(Integer, default=1)
    nodes_json = Column(Text, nullable=True) # React Flow nodes
    edges_json = Column(Text, nullable=True) # React Flow edges
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class PhoneNumber(Base):
    __tablename__ = "phone_numbers"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    provider = Column(String(50), default="Exotel")
    provider_account_id = Column(String(100), nullable=True)
    provider_number_id = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=False, unique=True)
    display_name = Column(String(100), nullable=False)
    purpose = Column(String(50), default="ADMISSION") # UNIVERSITY_GENERAL, ADMISSION, SCHOOL_SPECIFIC, CAMPAIGN, TEST
    scope = Column(String(50), default="GLOBAL") # GLOBAL, SCHOOL, COURSE
    school_id = Column(String(36), nullable=True)
    status = Column(String(20), default="ACTIVE") # ACTIVE, INACTIVE, CONFIG_REQUIRED
    voice_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=True)
    webhook_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class TelephonyProvider(Base):
    __tablename__ = "telephony_providers"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(100), default="Exotel")
    provider_type = Column(String(50), default="EXOTEL")
    account_reference = Column(String(100), default="svkm_dhule_exotel")
    status = Column(String(20), default="CONNECTED") # CONNECTED, NOT_CONNECTED, ERROR
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class CallSession(Base):
    __tablename__ = "call_sessions"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    provider_call_id = Column(String(100), nullable=True, index=True)
    caller_number = Column(String(30), nullable=False)
    caller_name = Column(String(100), nullable=True)
    virtual_number = Column(String(30), nullable=False)
    language = Column(String(20), default="en") # en, hi, mr, mixed
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    branch_id = Column(String(36), nullable=True)
    intent = Column(String(50), default="GENERAL_INFORMATION")
    current_workflow_node = Column(String(100), default="start_node")
    counselor_requested = Column(Boolean, default=False)
    status = Column(String(40), default="RECEIVED") # RECEIVED, ANSWERED, AI_ACTIVE, COUNSELOR_REQUESTED, WAITING_FOR_COUNSELOR, COUNSELOR_ACCEPTED, TRANSFER_IN_PROGRESS, COUNSELOR_CONNECTED, COMPLETED, FAILED, DISCONNECTED, TRANSFER_FAILED, TIMEOUT, CALLBACK_REQUIRED
    started_at = Column(DateTime, default=utc_now)
    answered_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    recording_url = Column(String(255), nullable=True)
    transcript = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    events = relationship("CallEvent", back_populates="call_session", cascade="all, delete-orphan")
    requests = relationship("CallerRequest", back_populates="call_session")

class CallEvent(Base):
    __tablename__ = "call_events"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    call_session_id = Column(String(36), ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False) # CALL_RECEIVED, CALL_ANSWERED, LANGUAGE_SELECTED, SCHOOL_IDENTIFIED, COURSE_IDENTIFIED, BRANCH_IDENTIFIED, AI_RESPONSE, COUNSELOR_REQUESTED, COUNSELORS_NOTIFIED, COUNSELOR_ACCEPTED, TRANSFER_STARTED, TRANSFER_CONNECTED, TRANSFER_FAILED, CALL_ENDED, TIMEOUT
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)
    
    call_session = relationship("CallSession", back_populates="events")

class CallerRequest(Base):
    __tablename__ = "caller_requests"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    call_session_id = Column(String(36), ForeignKey("call_sessions.id", ondelete="CASCADE"), nullable=False)
    caller_number = Column(String(30), nullable=False)
    caller_name = Column(String(100), nullable=True)
    language = Column(String(20), default="en")
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    branch_id = Column(String(36), nullable=True)
    query = Column(Text, nullable=True)
    status = Column(String(30), default="WAITING_FOR_ACCEPTANCE") # WAITING_FOR_ACCEPTANCE, ACCEPTED, DECLINED, TIMEOUT, CANCELLED, COMPLETED, CALLBACK_REQUIRED
    accepted_by = Column(String(36), ForeignKey("counselors.id", ondelete="SET NULL"), nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    call_session = relationship("CallSession", back_populates="requests")
    candidates = relationship("RequestCandidate", back_populates="request", cascade="all, delete-orphan")
    acceptances = relationship("RequestAcceptance", back_populates="request", cascade="all, delete-orphan")

class RequestCandidate(Base):
    __tablename__ = "request_candidates"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    request_id = Column(String(36), ForeignKey("caller_requests.id", ondelete="CASCADE"), nullable=False)
    counselor_id = Column(String(36), ForeignKey("counselors.id", ondelete="CASCADE"), nullable=False)
    eligibility_status = Column(String(20), default="ELIGIBLE")
    notification_status = Column(String(20), default="SENT")
    notified_at = Column(DateTime, default=utc_now)
    response = Column(String(20), default="PENDING") # PENDING, ACCEPTED, DECLINED, EXPIRED, CANCELLED
    responded_at = Column(DateTime, nullable=True)
    
    request = relationship("CallerRequest", back_populates="candidates")

class RequestAcceptance(Base):
    __tablename__ = "request_acceptances"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    request_id = Column(String(36), ForeignKey("caller_requests.id", ondelete="CASCADE"), nullable=False)
    counselor_id = Column(String(36), ForeignKey("counselors.id", ondelete="CASCADE"), nullable=False)
    accepted_at = Column(DateTime, default=utc_now)
    transfer_started_at = Column(DateTime, nullable=True)
    transfer_completed_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="ACCEPTED") # ACCEPTED, TRANSFERRING, CONNECTED, FAILED
    failure_reason = Column(String(255), nullable=True)
    
    request = relationship("CallerRequest", back_populates="acceptances")

class CallbackRequest(Base):
    __tablename__ = "callback_requests"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    call_id = Column(String(36), nullable=True)
    caller_number = Column(String(30), nullable=False)
    caller_name = Column(String(100), nullable=True)
    language = Column(String(20), default="en")
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    branch_id = Column(String(36), nullable=True)
    query = Column(Text, nullable=True)
    preferred_callback_time = Column(String(100), nullable=True)
    assigned_counselor_id = Column(String(36), nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, IN_PROGRESS, RESOLVED, CANCELLED
    created_at = Column(DateTime, default=utc_now)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    request_id = Column(String(36), nullable=False)
    counselor_id = Column(String(36), nullable=False)
    channel = Column(String(30), nullable=False) # DASHBOARD, EMAIL, WHATSAPP, SMS, MISSED_CALL
    status = Column(String(20), default="SENT") # PENDING, SENT, DELIVERED, READ, FAILED
    provider_message_id = Column(String(100), nullable=True)
    retry_count = Column(Integer, default=0)
    sent_at = Column(DateTime, default=utc_now)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    failure_reason = Column(String(255), nullable=True)

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    notification_id = Column(String(36), nullable=False)
    channel = Column(String(30), nullable=False)
    event = Column(String(50), nullable=False)
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

class WorkingHours(Base):
    __tablename__ = "working_hours"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="17:30")
    is_closed = Column(Boolean, default=False)
    timezone = Column(String(50), default="Asia/Kolkata")
    active = Column(Boolean, default=True)

class Holiday(Base):
    __tablename__ = "holidays"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    description = Column(Text, nullable=True)
    is_closed = Column(Boolean, default=True)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class SpecialSchedule(Base):
    __tablename__ = "special_schedules"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    date = Column(String(20), nullable=False) # YYYY-MM-DD
    start_time = Column(String(10), default="09:00")
    end_time = Column(String(10), default="17:30")
    is_closed = Column(Boolean, default=False)
    reason = Column(String(255), nullable=True)

class MultilingualMessage(Base):
    __tablename__ = "multilingual_messages"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    message_key = Column(String(100), nullable=False) # WELCOME, OUTSIDE_WORKING_HOURS, COUNSELOR_WAITING, COUNSELOR_CONNECTED, ALL_BUSY, NO_ANSWER, TRANSFER_FAILED, CALLBACK_CONFIRMATION, GOODBYE
    language = Column(String(20), nullable=False) # en, hi, mr
    message_text = Column(Text, nullable=False)
    status = Column(String(20), default="ACTIVE")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    event_name = Column(String(100), nullable=False) # call_started, call_answered, counselor_requested, counselor_accepted, transfer_started, transfer_completed
    call_id = Column(String(36), nullable=True)
    school_id = Column(String(36), nullable=True)
    course_id = Column(String(36), nullable=True)
    counselor_id = Column(String(36), nullable=True)
    language = Column(String(20), nullable=True)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), nullable=True)
    user_name = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=utc_now)

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id = Column(String(36), primary_key=True, default=gen_uuid)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
