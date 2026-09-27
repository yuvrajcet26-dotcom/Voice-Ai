export type UserRole = 'MAIN_ADMIN' | 'REGISTRAR' | 'COUNSELOR';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  phone?: string;
  counselor?: {
    counselor_id: string;
    current_state: CounselorState;
    phone_number: string;
  };
}

export type CounselorState = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK' | 'DO_NOT_DISTURB';

export interface CounselorAssignment {
  id: string;
  school_id: string;
  school_code?: string;
  school_name?: string;
  course_id?: string;
  branch_id?: string;
  priority: number;
  active: boolean;
}

export interface Counselor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  designation: string;
  status: string;
  current_state: CounselorState;
  assignments: CounselorAssignment[];
}

export type AcademicStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface School {
  id: string;
  name: string;
  code: string;
  short_name: string;
  description?: string;
  head_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: AcademicStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  school_id: string;
  name: string;
  code: string;
  description?: string;
  eligibility?: string;
  duration?: string;
  intake: number;
  fees?: string;
  admission_process?: string;
  status: AcademicStatus;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  course_id: string;
  name: string;
  code: string;
  description?: string;
  eligibility?: string;
  intake: number;
  fees?: string;
  duration?: string;
  facilities?: string;
  placement_info?: string;
  status: AcademicStatus;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: string;
  provider: string;
  phone_number: string;
  display_name: string;
  purpose: string;
  scope: string;
  school_id?: string;
  status: string;
  voice_enabled: boolean;
  sms_enabled: boolean;
  webhook_url?: string;
  created_at: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  school_id?: string;
  course_id?: string;
  branch_id?: string;
  language: string;
  status: AcademicStatus;
  created_at: string;
  updated_at: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  language: string;
  school_id?: string;
  course_id?: string;
  branch_id?: string;
  category: string;
  status: AcademicStatus;
  created_at: string;
}

export interface WorkingHoursItem {
  id: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  is_closed: boolean;
  timezone: string;
  active: boolean;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  description?: string;
  is_closed: boolean;
}

export interface RequestCandidate {
  counselor_id: string;
  counselor_name: string;
  response: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';
  notified_at: string;
}

export interface CallerRequest {
  id: string;
  call_session_id: string;
  caller_number: string;
  caller_name?: string;
  language: string;
  school_id?: string;
  course_id?: string;
  branch_id?: string;
  query?: string;
  status: 'WAITING_FOR_ACCEPTANCE' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT' | 'CANCELLED' | 'COMPLETED' | 'CALLBACK_REQUIRED';
  accepted_by?: string;
  accepted_by_name?: string;
  created_at: string;
  accepted_at?: string;
  candidates: RequestCandidate[];
}

export interface CallEvent {
  id: string;
  event_type: string;
  details?: string;
  timestamp: string;
}

export interface CallSession {
  id: string;
  provider_call_id?: string;
  caller_number: string;
  caller_name?: string;
  virtual_number: string;
  language: string;
  school_id?: string;
  course_id?: string;
  branch_id?: string;
  intent: string;
  status: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  events_count?: number;
  events?: CallEvent[];
}

export interface DashboardMetrics {
  total_calls: number;
  active_calls: number;
  pending_requests: number;
  available_counselors: number;
  busy_counselors: number;
  callback_requests: number;
  calls_by_language: { name: string; value: number }[];
  calls_by_school: { name: string; calls: number }[];
  calls_by_day: { day: string; calls: number }[];
  transfer_stats: {
    connected: number;
    failed: number;
    success_rate: number;
  };
}

export interface TurnResponse {
  call_id: string;
  caller_text: string;
  detected_language: string;
  detected_intent: string;
  detected_entities: {
    school?: string;
    course?: string;
    branch?: string;
    caller_name?: string;
  };
  ai_response_text: string;
  audio_base64?: string;
  counselor_requested: boolean;
  counselor_dispatch_status?: string;
  call_status: string;
  workflow_node: string;
}
