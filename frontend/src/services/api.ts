import {
  School, Course, Branch, Counselor, CallerRequest,
  CallSession, PhoneNumber, KnowledgeItem, FAQItem,
  WorkingHoursItem, HolidayItem, DashboardMetrics, TurnResponse
} from '../types';

const API_BASE = '/api/v1';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('svkm_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options?.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || err.message || 'API request failed');
    }
    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${url}, fallback logic may apply:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      return fetchJSON<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
    },
    me: async () => fetchJSON<any>('/auth/me')
  },

  // Schools
  schools: {
    list: async (status?: string) => {
      const q = status ? `?status=${status}` : '';
      return fetchJSON<School[]>(`/schools${q}`);
    },
    create: async (data: Partial<School>) => {
      return fetchJSON<School>('/schools', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<School>) => {
      return fetchJSON<School>(`/schools/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    publish: async (id: string) => {
      return fetchJSON<any>(`/schools/${id}/publish`, { method: 'POST' });
    },
    delete: async (id: string) => {
      return fetchJSON<any>(`/schools/${id}`, { method: 'DELETE' });
    }
  },

  // Courses
  courses: {
    list: async (schoolId?: string) => {
      const q = schoolId ? `?school_id=${schoolId}` : '';
      return fetchJSON<Course[]>(`/courses${q}`);
    },
    create: async (data: Partial<Course>) => {
      return fetchJSON<Course>('/courses', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<Course>) => {
      return fetchJSON<Course>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => {
      return fetchJSON<any>(`/courses/${id}`, { method: 'DELETE' });
    }
  },

  // Branches
  branches: {
    list: async (courseId?: string) => {
      const q = courseId ? `?course_id=${courseId}` : '';
      return fetchJSON<Branch[]>(`/branches${q}`);
    },
    create: async (data: Partial<Branch>) => {
      return fetchJSON<Branch>('/branches', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<Branch>) => {
      return fetchJSON<Branch>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => {
      return fetchJSON<any>(`/branches/${id}`, { method: 'DELETE' });
    }
  },

  // Counselors
  counselors: {
    list: async (schoolId?: string, state?: string) => {
      const params = new URLSearchParams();
      if (schoolId) params.append('school_id', schoolId);
      if (state) params.append('current_state', state);
      return fetchJSON<Counselor[]>(`/counselors?${params.toString()}`);
    },
    get: async (id: string) => fetchJSON<Counselor>(`/counselors/${id}`),
    updateAvailability: async (id: string, state: string) => {
      return fetchJSON<any>(`/counselors/${id}/availability`, {
        method: 'PUT',
        body: JSON.stringify({ current_state: state })
      });
    },
    addAssignment: async (id: string, data: any) => {
      return fetchJSON<any>(`/counselors/${id}/assignments`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  // Caller Requests
  requests: {
    list: async (counselorId?: string, status?: string) => {
      const params = new URLSearchParams();
      if (counselorId) params.append('counselor_id', counselorId);
      if (status) params.append('status', status);
      return fetchJSON<CallerRequest[]>(`/requests?${params.toString()}`);
    },
    get: async (id: string) => fetchJSON<CallerRequest>(`/requests/${id}`),
    accept: async (id: string, counselorId: string) => {
      return fetchJSON<any>(`/requests/${id}/accept`, {
        method: 'POST',
        body: JSON.stringify({ counselor_id: counselorId })
      });
    },
    decline: async (id: string, counselorId: string, reason?: string) => {
      return fetchJSON<any>(`/requests/${id}/decline`, {
        method: 'POST',
        body: JSON.stringify({ counselor_id: counselorId, reason })
      });
    }
  },

  // Calls
  calls: {
    list: async (status?: string) => {
      const q = status ? `?status=${status}` : '';
      return fetchJSON<CallSession[]>(`/calls${q}`);
    },
    get: async (id: string) => fetchJSON<CallSession>(`/calls/${id}`),
    terminate: async (id: string) => {
      return fetchJSON<any>(`/calls/${id}/terminate`, { method: 'POST' });
    }
  },

  // Telephony
  telephony: {
    getProviders: async () => fetchJSON<any[]>('/telephony/providers'),
    getNumbers: async () => fetchJSON<PhoneNumber[]>('/telephony/numbers'),
    createNumber: async (data: Partial<PhoneNumber>) => {
      return fetchJSON<PhoneNumber>('/telephony/numbers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    testNumber: async (id: string) => {
      return fetchJSON<any>(`/telephony/numbers/${id}/test`, { method: 'POST' });
    }
  },

  // Knowledge Base & FAQ
  knowledge: {
    list: async (cat?: string, lang?: string) => {
      const params = new URLSearchParams();
      if (cat) params.append('category', cat);
      if (lang) params.append('language', lang);
      return fetchJSON<KnowledgeItem[]>(`/knowledge?${params.toString()}`);
    },
    create: async (data: Partial<KnowledgeItem>) => {
      return fetchJSON<KnowledgeItem>('/knowledge', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<KnowledgeItem>) => {
      return fetchJSON<KnowledgeItem>(`/knowledge/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    publish: async (id: string) => fetchJSON<any>(`/knowledge/${id}/publish`, { method: 'POST' }),
    delete: async (id: string) => fetchJSON<any>(`/knowledge/${id}`, { method: 'DELETE' })
  },

  faqs: {
    list: async (lang?: string) => {
      const q = lang ? `?language=${lang}` : '';
      return fetchJSON<FAQItem[]>(`/faqs${q}`);
    },
    create: async (data: Partial<FAQItem>) => {
      return fetchJSON<FAQItem>('/faqs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: Partial<FAQItem>) => {
      return fetchJSON<FAQItem>(`/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => fetchJSON<any>(`/faqs/${id}`, { method: 'DELETE' })
  },

  // Working Hours & Holidays
  workingHours: {
    list: async () => fetchJSON<WorkingHoursItem[]>('/working-hours'),
    update: async (items: any[]) => {
      return fetchJSON<any>('/working-hours', {
        method: 'PUT',
        body: JSON.stringify(items)
      });
    },
    status: async () => fetchJSON<any>('/working-hours/status'),
    getHolidays: async () => fetchJSON<HolidayItem[]>('/working-hours/holidays'),
    addHoliday: async (data: Partial<HolidayItem>) => {
      return fetchJSON<HolidayItem>('/working-hours/holidays', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    deleteHoliday: async (id: string) => fetchJSON<any>(`/working-hours/holidays/${id}`, { method: 'DELETE' })
  },

  // Analytics
  analytics: {
    dashboard: async () => fetchJSON<DashboardMetrics>('/analytics/dashboard')
  },

  // Workflows
  workflows: {
    list: async () => fetchJSON<any[]>('/workflows'),
    active: async () => fetchJSON<any>('/workflows/active'),
    save: async (data: any) => {
      return fetchJSON<any>('/workflows', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    publish: async (id: string) => fetchJSON<any>(`/workflows/${id}/publish`, { method: 'POST' })
  },

  // Settings
  settings: {
    get: async () => fetchJSON<any>('/settings'),
    update: async (data: any) => {
      return fetchJSON<any>('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  },

  // Notifications
  notifications: {
    logs: async () => fetchJSON<any[]>('/notifications/logs'),
    test: async () => fetchJSON<any>('/notifications/test', { method: 'POST' })
  },

  // Call Simulator & Test Scenarios
  simulator: {
    start: async (callerNumber?: string, language?: string, callerName?: string) => {
      return fetchJSON<any>('/simulator/start', {
        method: 'POST',
        body: JSON.stringify({
          caller_number: callerNumber || '+919876543210',
          language: language || 'en',
          caller_name: callerName || 'Prospective Student'
        })
      });
    },
    turn: async (callId: string, textInput: string, languageOverride?: string) => {
      return fetchJSON<TurnResponse>('/simulator/turn', {
        method: 'POST',
        body: JSON.stringify({
          call_id: callId,
          text_input: textInput,
          language_override: languageOverride
        })
      });
    },
    testFiveCounselors: async () => fetchJSON<any>('/simulator/test-five-counselors', { method: 'POST' }),
    testConcurrentAcceptance: async () => fetchJSON<any>('/simulator/test-concurrent-acceptance', { method: 'POST' })
  }
};
