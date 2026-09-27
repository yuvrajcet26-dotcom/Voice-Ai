import React, { useState, useEffect } from 'react';
import {
  PhoneIncoming, Users, CheckCircle2, Clock, XCircle, Search,
  Filter, Building, PhoneForwarded, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { CallerRequest } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Requests: React.FC = () => {
  const [requests, setRequests] = useState<CallerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.requests.list();
      setRequests(data);
    } catch (e) {
      console.warn('Using default requests mock:', e);
      setRequests([
        {
          id: 'req-201',
          call_session_id: 'call-101',
          caller_number: '+91 9876543210',
          caller_name: 'Rohit Kulkarni',
          language: 'Marathi',
          school_id: 'STME',
          course_id: 'B.Tech',
          branch_id: 'Electrical Engineering',
          query: 'STME madhe B.Tech Electrical Engineering chi fees ani eligibility kay ahe?',
          status: 'ACCEPTED',
          accepted_by: 'counselor-stme-d',
          accepted_by_name: 'Prof. Deepali Kulkarni',
          created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          accepted_at: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
          candidates: [
            { counselor_id: 'counselor-stme-c', counselor_name: 'Prof. Chetan Deshmukh', response: 'CANCELLED', notified_at: '' },
            { counselor_id: 'counselor-stme-d', counselor_name: 'Prof. Deepali Kulkarni', response: 'ACCEPTED', notified_at: '' },
            { counselor_id: 'counselor-stme-e', counselor_name: 'Prof. Eknath Shinde', response: 'CANCELLED', notified_at: '' }
          ]
        },
        {
          id: 'req-202',
          call_session_id: 'call-104',
          caller_number: '+91 9811223344',
          caller_name: 'Suresh Patil',
          language: 'Hindi',
          school_id: 'SOC',
          course_id: 'BBA',
          query: 'Outside working hours inquiry. Callback requested for morning 10 AM.',
          status: 'CALLBACK_REQUIRED',
          created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
          candidates: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter(r => {
    const matchesSearch = r.caller_number.includes(searchTerm) ||
                          (r.caller_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admission Counselor Requests & Queue</h2>
          <p className="text-sm text-slate-500">
            Escalated caller requests, multi-candidate dispatch status, atomic acceptance audit, and callbacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            Total Requests: {requests.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search phone number or caller name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Request States</option>
            <option value="WAITING_FOR_ACCEPTANCE">WAITING FOR ACCEPTANCE</option>
            <option value="ACCEPTED">ACCEPTED (Locked)</option>
            <option value="CALLBACK_REQUIRED">CALLBACK REQUIRED</option>
            <option value="TIMEOUT">TIMEOUT</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="space-y-4">
        {filtered.map(req => (
          <div
            key={req.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {req.school_id || 'SVKM'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {req.caller_name || 'Prospective Caller'} • <span className="font-mono text-slate-600">{req.caller_number}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Language: <strong className="text-blue-700 uppercase">{req.language}</strong> • Target: {req.school_id} ({req.course_id || 'General'})
                  </p>
                </div>
              </div>

              <StatusBadge status={req.status} />
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
              "{req.query || 'Admission counselor assistance requested.'}"
            </p>

            {/* Candidates Dispatched & Atomic Lock Details */}
            {req.candidates && req.candidates.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Counselor Candidates Pool Notified:
                </span>
                <div className="flex flex-wrap gap-2">
                  {req.candidates.map((cand, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border font-medium ${
                        cand.response === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span>{cand.counselor_name}:</span>
                      <span className="uppercase text-[10px]">{cand.response}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Winner notice if accepted */}
            {req.accepted_by_name && (
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  First Acceptance Winner: <strong>{req.accepted_by_name}</strong>
                </span>
                <span className="text-[11px] text-emerald-700">
                  Transferred at {new Date(req.accepted_at || req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
