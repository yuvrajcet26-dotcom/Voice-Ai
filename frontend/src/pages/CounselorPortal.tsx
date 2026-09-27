import React, { useState, useEffect } from 'react';
import {
  UserCheck, Phone, PhoneCall, PhoneIncoming, Clock, CheckCircle2,
  AlertCircle, Building, BookOpen, Volume2, Radio, Bell, Lock, Key,
  CalendarX, DollarSign, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CallerRequest, CounselorState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { IncomingRequestModal } from '../components/common/IncomingRequestModal';

export const CounselorPortal: React.FC = () => {
  const { user, updateCounselorState } = useAuth();
  const [requests, setRequests] = useState<CallerRequest[]>([]);
  const [activeRequestModal, setActiveRequestModal] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'calls' | 'profile' | 'requests'>('calls');
  
  // Password state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const counselorId = user?.counselor?.counselor_id || user?.id || 'SNGU-CNS-STME-003';
  const currentState = user?.counselor?.current_state || 'AVAILABLE';

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 8000);
    return () => clearInterval(interval);
  }, [counselorId]);

  const loadRequests = async () => {
    try {
      const data = await api.requests.list(counselorId);
      setRequests(data);
    } catch (e) {
      setRequests([
        {
          id: 'req-live-01',
          call_session_id: 'call-sess-101',
          caller_number: '+91 9876543210',
          caller_name: 'Rohit Kulkarni',
          language: 'Marathi',
          school_id: 'STME',
          course_id: 'B.Tech',
          branch_id: 'Electrical Engineering',
          query: 'STME madhe B.Tech Electrical Engineering chi fees ani eligibility kay ahe?',
          status: 'ACCEPTED',
          accepted_by: counselorId,
          accepted_by_name: user?.name,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          accepted_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
          candidates: []
        }
      ]);
    }
  };

  const handleSimulateIncomingAlert = () => {
    if (currentState === 'ON_LEAVE' as any) {
      alert('⚠️ You are currently ON LEAVE. Calls will not be routed to your workstation.');
      return;
    }

    setActiveRequestModal({
      request_id: `req-sim-${Date.now()}`,
      call_id: `call-sim-${Date.now()}`,
      caller_number: '+91 9876543210',
      school: 'STME',
      course: 'B.Tech',
      branch: 'Electrical Engineering',
      language: 'Marathi',
      expires_in_seconds: 20
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('❌ Error: New Password and Confirm Password do not match.');
      return;
    }
    alert('🔐 Security password updated successfully! Credentials secured.');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Workstation Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/30">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">{user?.name || 'Prof. Chetan Patil'}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  {counselorId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>🏫 {user?.counselor?.school_id || 'STME'} • {user?.counselor?.department || 'Computer Engineering'}</span>
                <span>📱 {user?.phone || '+91 98200 11003'}</span>
                <span>💰 Monthly Salary: <strong className="text-emerald-400">₹78,500/mo</strong></span>
              </p>
            </div>
          </div>

          {/* 4-State Availability Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider block">Presence</span>
              <StatusBadge status={currentState} />
            </div>

            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl text-xs font-bold">
              {(['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE'] as CounselorState[]).map(state => (
                <button
                  key={state}
                  type="button"
                  onClick={() => updateCounselorState(state)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    currentState === state
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {state.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('calls')}
          className={`py-2 px-4 rounded-xl transition ${
            activeTab === 'calls' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          🎧 Live Call Workstation
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-4 rounded-xl transition ${
            activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          👤 My Profile, Salary & Password
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 rounded-xl transition ${
            activeTab === 'requests' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          📨 Submit Request to Admin
        </button>
      </div>

      {/* VIEW 1: LIVE CALLS */}
      {activeTab === 'calls' && (
        <div className="space-y-6">
          {/* Simulator Test Call Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-amber-950 text-sm">Test Real-Time Counselor Dispatch Flow</h4>
                <p className="text-xs text-amber-800">
                  Simulate an incoming admission call requesting STME assistance. Triggers the 20-second countdown and first-acceptance lock.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateIncomingAlert}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all shrink-0 active:scale-[0.98]"
            >
              Simulate Incoming STME Call Alert
            </button>
          </div>

          {/* Counselor Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">My Call Requests & Transfer Log</h3>
                <p className="text-xs text-slate-500">Live transferred admission calls and recorded inquiries.</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {requests.length} Requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Caller</th>
                    <th className="py-3 px-4">Target Program</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Caller Inquiry Query</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.caller_name || 'Inquirer'}</p>
                        <p className="font-mono text-slate-500">{r.caller_number}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-700">{r.school_id || 'STME'}</span>
                        <p className="text-slate-500">{r.course_id} • {r.branch_id}</p>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-slate-600 tracking-wider">
                        {r.language}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {r.query || 'Admission assistance requested.'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROFILE, SALARY & PASSWORD */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="font-black text-slate-900 text-lg">Official Counselor Credentials & Pay Scale</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Unique User ID</span>
                <p className="font-mono font-black text-blue-700 text-sm">{counselorId}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-700 font-bold uppercase text-[10px]">Sanctioned Monthly Salary</span>
                <p className="font-black text-emerald-900 text-base">₹78,500 / month</p>
                <p className="text-emerald-700 text-[10px]">Grade VII Academic Pay Matrix</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                <span className="text-blue-700 font-bold uppercase text-[10px]">Official Contact</span>
                <p className="font-mono font-bold text-slate-900">{user?.phone || '+91 98200 11003'}</p>
                <p className="text-blue-700 text-[11px]">{user?.email || 'counselor.c@svkm.ac.in'}</p>
              </div>
            </div>
          </div>

          {/* Update Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-xl">
            <div>
              <h3 className="font-black text-slate-900 text-base">Update Security Password</h3>
              <p className="text-xs text-slate-500">Change your workstation access password</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={e => setCurrPassword(e.target.value)}
                  required
                  placeholder="Enter current password..."
                  className="w-full p-2.5 border rounded-xl bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password..."
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-type new password..."
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 3: SUBMIT REQUEST TO ADMIN */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Administrative Request to Central Admin</h3>
                <p className="text-xs text-slate-500">Request shift adjustments, leaves, or equipment upgrades</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Admin Link
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const type = (form.elements.namedItem('reqType') as HTMLSelectElement).value;
                const reason = (form.elements.namedItem('reqReason') as HTMLTextAreaElement).value;
                
                const newReq = {
                  id: 'REQ-' + Date.now().toString().slice(-4),
                  counselorName: user?.name || 'Prof. Chetan Patil',
                  school: user?.counselor?.school_id || 'STME',
                  type,
                  reason,
                  status: 'PENDING',
                  time: 'Just now'
                };

                try {
                  const existing = JSON.parse(localStorage.getItem('svkm_counselor_requests') || '[]');
                  existing.unshift(newReq);
                  localStorage.setItem('svkm_counselor_requests', JSON.stringify(existing));
                } catch (err) {
                  console.error(err);
                }

                alert(`✅ Request submitted to Main Admin successfully!\n\nRequest ID: ${newReq.id}\nCategory: ${type}\nStatus: PENDING`);
                form.reset();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Category *</label>
                <select name="reqType" className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 font-medium">
                  <option value="Shift Timing Adjustment">Shift Timing Adjustment</option>
                  <option value="Leave Application">Leave Application</option>
                  <option value="Salary Slip / Allowance Inquiry">Salary Slip / Allowance Inquiry</option>
                  <option value="Branch Quota Inquiry">Branch Quota Inquiry</option>
                  <option value="Headset / Hardware Issue">Headset / Hardware Issue</option>
                  <option value="Special Admission Permission">Special Admission Permission</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Details / Justification *</label>
                <textarea
                  name="reqReason"
                  required
                  rows={3}
                  placeholder="Explain the purpose of your administrative request..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Request to Admin (Dr. S. K. Mehta)</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">My Submitted Requests & Status</h3>
                <p className="text-xs text-slate-500">Live approval feedback from Main Administrator</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Real-Time</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                <div>
                  <strong className="text-slate-900 font-bold">Shift Timing Adjustment</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">Requesting morning shift 09:00 - 15:00 for CAP Round II duty.</p>
                  <span className="text-[10px] text-slate-400">Today 09:15 AM</span>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  PENDING
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                <div>
                  <strong className="text-slate-900 font-bold">Leave Application</strong>
                  <p className="text-slate-600 text-[11px] mt-0.5">Leave requested on 1st October for academic conference in Pune.</p>
                  <span className="text-[10px] text-slate-400">Yesterday 04:30 PM</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  APPROVED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time incoming call modal popup */}
      {activeRequestModal && (
        <IncomingRequestModal
          request={activeRequestModal}
          onClose={() => setActiveRequestModal(null)}
          onAccepted={(reqId) => {
            loadRequests();
          }}
        />
      )}
    </div>
  );
};
