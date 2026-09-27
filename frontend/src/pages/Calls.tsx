import React, { useState, useEffect } from 'react';
import {
  History, PhoneCall, Clock, CheckCircle2, AlertCircle, Play,
  Search, Filter, ChevronRight, User, Globe, Building
} from 'lucide-react';
import { api } from '../services/api';
import { CallSession } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const Calls: React.FC = () => {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCalls = async () => {
    try {
      const data = await api.calls.list();
      setCalls(data);
    } catch (e) {
      console.warn('Using default calls mock:', e);
      setCalls([
        {
          id: 'call-101',
          provider_call_id: 'exotel_sid_98124',
          caller_number: '+91 9876543210',
          caller_name: 'Rohit Kulkarni',
          virtual_number: '+91 2562 281456',
          language: 'mr',
          school_id: 'STME',
          course_id: 'B.Tech',
          branch_id: 'Electrical Engineering',
          intent: 'ADMISSION_INFORMATION',
          status: 'COUNSELOR_CONNECTED',
          started_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          duration_seconds: 245,
          events_count: 7
        },
        {
          id: 'call-102',
          provider_call_id: 'exotel_sid_98125',
          caller_number: '+91 9823456789',
          caller_name: 'Pooja Agarwal',
          virtual_number: '+91 2562 281456',
          language: 'hi',
          school_id: 'SOC',
          course_id: 'BBA',
          intent: 'FEES',
          status: 'COMPLETED',
          started_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          duration_seconds: 130,
          events_count: 5
        },
        {
          id: 'call-103',
          provider_call_id: 'exotel_sid_98126',
          caller_number: '+91 9911223344',
          caller_name: 'Aakash Verma',
          virtual_number: '+91 2562 281456',
          language: 'en',
          school_id: 'STME',
          course_id: 'B.Tech',
          intent: 'ELIGIBILITY',
          status: 'COMPLETED',
          started_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          duration_seconds: 95,
          events_count: 4
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCall = async (callId: string) => {
    try {
      const details = await api.calls.get(callId);
      setSelectedCall(details);
    } catch (e) {
      // Fallback details
      const base = calls.find(c => c.id === callId);
      if (base) {
        setSelectedCall({
          ...base,
          events: [
            { id: '1', event_type: 'CALL_RECEIVED', details: 'Incoming call from +91 9876543210 to ExoPhone +91 2562 281456', timestamp: base.started_at },
            { id: '2', event_type: 'LANGUAGE_SELECTED', details: 'Language detected: Marathi (mr)', timestamp: base.started_at },
            { id: '3', event_type: 'SCHOOL_IDENTIFIED', details: 'School identified: STME (School of Technology Management & Engineering)', timestamp: base.started_at },
            { id: '4', event_type: 'COURSE_IDENTIFIED', details: 'Course: B.Tech, Branch: Electrical Engineering', timestamp: base.started_at },
            { id: '5', event_type: 'COUNSELOR_REQUESTED', details: 'Caller requested human admission counselor', timestamp: base.started_at },
            { id: '6', event_type: 'COUNSELOR_ACCEPTED', details: 'Accepted by Counselor D (Prof. Deepali Kulkarni). Call transferred.', timestamp: base.started_at },
            { id: '7', event_type: 'TRANSFER_CONNECTED', details: 'Live two-way audio active on counselor mobile', timestamp: base.started_at }
          ]
        });
      }
    }
  };

  const filtered = calls.filter(c => {
    const matchesSearch = c.caller_number.includes(searchTerm) ||
                          (c.caller_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Call Sessions & Audit Timelines</h2>
          <p className="text-sm text-slate-500">
            Real-time and historic telephone sessions, language detection events, and counselor transfer audit trails.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          {calls.length} Total Sessions
        </span>
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
            <option value="ALL">All Statuses</option>
            <option value="COUNSELOR_CONNECTED">COUNSELOR CONNECTED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="WAITING_FOR_COUNSELOR">WAITING FOR COUNSELOR</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calls Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
            Call Logs Stream
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Caller / Target</th>
                  <th className="py-3 px-4">Lang</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(call => (
                  <tr
                    key={call.id}
                    onClick={() => handleSelectCall(call.id)}
                    className={`hover:bg-blue-50/60 cursor-pointer transition-colors ${
                      selectedCall?.id === call.id ? 'bg-blue-50/80 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{call.caller_name || 'Caller'}</p>
                      <p className="font-mono text-slate-500">{call.caller_number}</p>
                      <span className="text-[10px] text-blue-600 font-semibold">{call.school_id || 'General'}</span>
                    </td>
                    <td className="py-3 px-4 uppercase font-bold text-slate-600">
                      {call.language}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px]"
                      >
                        Timeline <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Timeline & Events Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          {selectedCall ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">Call Session Details</h3>
                  <StatusBadge status={selectedCall.status} />
                </div>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedCall.provider_call_id || selectedCall.id}</p>
              </div>

              {/* Summary attributes */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">CALLER PHONE</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCall.caller_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VIRTUAL NUMBER</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCall.virtual_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">LANGUAGE</span>
                  <span className="font-bold text-blue-700 uppercase">{selectedCall.language}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CLASSIFIED INTENT</span>
                  <span className="font-bold text-slate-800">{selectedCall.intent}</span>
                </div>
              </div>

              {/* Event Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-3">Lifecycle Event Timeline</h4>
                <div className="relative pl-4 space-y-4 border-l-2 border-slate-200 ml-2 text-xs">
                  {selectedCall.events?.map((ev: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white" />
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">{ev.event_type}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{ev.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <History className="w-8 h-8" />
              <p className="text-xs">Click on any call row on the left to inspect its complete audit timeline.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
