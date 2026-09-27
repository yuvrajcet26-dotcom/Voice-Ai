from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    username: str
    phone: Optional[str] = None
    role: str
    status: str

# School
class SchoolBase(BaseModel):
    name: str
    code: str
    short_name: str
    description: Optional[str] = None
    head_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    head_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None

class SchoolResponse(SchoolBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Course
class CourseBase(BaseModel):
    school_id: str
    name: str
    code: str
    description: Optional[str] = None
    eligibility: Optional[str] = None
    duration: Optional[str] = None
    intake: Optional[int] = 60
    fees: Optional[str] = None
    admission_process: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    duration: Optional[str] = None
    intake: Optional[int] = None
    fees: Optional[str] = None
    admission_process: Optional[str] = None
    status: Optional[str] = None

class CourseResponse(CourseBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Branch
class BranchBase(BaseModel):
    course_id: str
    name: str
    code: str
    description: Optional[str] = None
    eligibility: Optional[str] = None
    intake: Optional[int] = 60
    fees: Optional[str] = None
    duration: Optional[str] = None
    facilities: Optional[str] = None
    placement_info: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    intake: Optional[int] = None
    fees: Optional[str] = None
    duration: Optional[str] = None
    facilities: Optional[str] = None
    placement_info: Optional[str] = None
    status: Optional[str] = None

class BranchResponse(BranchBase):
    id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Counselor
class CounselorResponse(BaseModel):
    id: str
    user_id: str
    name: Optional[str] = None
    email: str
    phone_number: str
    designation: str
    status: str
    current_state: str # AVAILABLE, BUSY, OFFLINE, ON_BREAK, DO_NOT_DISTURB
    assignments: Optional[List[Dict[str, Any]]] = []

    class Config:
        from_attributes = True

class CounselorAvailabilityUpdate(BaseModel):
    current_state: str # AVAILABLE, BUSY, OFFLINE, ON_BREAK, DO_NOT_DISTURB

class CounselorAssignmentCreate(BaseModel):
    school_id: str
    course_id: Optional[str] = None
    branch_id: Optional[str] = None
    priority: int = 1

# Phone Numbers
class PhoneNumberCreate(BaseModel):
    phone_number: str
    display_name: str
    provider: str = "Exotel"
    purpose: str = "ADMISSION"
    scope: str = "GLOBAL"
    school_id: Optional[str] = None
    voice_enabled: bool = True
    sms_enabled: bool = True
    webhook_url: Optional[str] = None

class PhoneNumberResponse(BaseModel):
    id: str
    provider: str
    phone_number: str
    display_name: str
    purpose: str
    scope: str
    school_id: Optional[str] = None
    status: str
    voice_enabled: bool
    sms_enabled: bool
    webhook_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Knowledge & FAQ
class KnowledgeCreate(BaseModel):
    title: str
    category: str
    content: str
    school_id: Optional[str] = None
    course_id: Optional[str] = None
    branch_id: Optional[str] = None
    language: str = "en"
    status: str = "PUBLISHED"

class KnowledgeResponse(KnowledgeCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FAQCreate(BaseModel):
    question: str
    answer: str
    language: str = "en"
    school_id: Optional[str] = None
    course_id: Optional[str] = None
    branch_id: Optional[str] = None
    category: str = "General"
    status: str = "PUBLISHED"

class FAQResponse(FAQCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Working Hours & Holidays
class WorkingHoursUpdate(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    is_closed: bool

class HolidayCreate(BaseModel):
    name: str
    date: str
    description: Optional[str] = None
    is_closed: bool = True

class HolidayResponse(HolidayCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Requests
class RequestAcceptPayload(BaseModel):
    counselor_id: str

class RequestDeclinePayload(BaseModel):
    counselor_id: str
    reason: Optional[str] = None

class CallerRequestResponse(BaseModel):
    id: str
    call_session_id: str
    caller_number: str
    caller_name: Optional[str] = None
    language: str
    school_id: Optional[str] = None
    course_id: Optional[str] = None
    branch_id: Optional[str] = None
    query: Optional[str] = None
    status: str
    accepted_by: Optional[str] = None
    accepted_by_name: Optional[str] = None
    created_at: datetime
    accepted_at: Optional[datetime] = None
    candidates: Optional[List[Dict[str, Any]]] = []

    class Config:
        from_attributes = True

# Call Simulator & AI
class StartCallRequest(BaseModel):
    caller_number: str = "+919876543210"
    caller_name: Optional[str] = "Student / Parent"
    virtual_number: str = "+912562281456"
    language: str = "en" # en, hi, mr

class TurnRequest(BaseModel):
    call_id: str
    text_input: Optional[str] = None
    audio_base64: Optional[str] = None
    language_override: Optional[str] = None

class TurnResponse(BaseModel):
    call_id: str
    caller_text: str
    detected_language: str
    detected_intent: str
    detected_entities: Dict[str, Any]
    ai_response_text: str
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    counselor_requested: bool
    counselor_dispatch_status: Optional[str] = None
    assigned_counselor: Optional[Dict[str, Any]] = None
    call_status: str
    workflow_node: str

class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    version: int
    nodes_json: Optional[str] = None
    edges_json: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkflowSaveRequest(BaseModel):
    name: str
    description: Optional[str] = None
    nodes_json: str
    edges_json: str
    status: str = "PUBLISHED"
