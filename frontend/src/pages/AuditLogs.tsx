import React, { useState } from 'react';
import {
  ShieldAlert, Search, Filter, Clock, CheckCircle2, User, Building
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const logs = [
    { id: '1', user: 'Dr. S. K. Mehta (Main Admin)', action: 'PUBLISH_SCHOOL', entity: 'School: STME', ip: '192.168.1.10', time: '10 mins ago' },
    { id: '2', user: 'Prof. Deepali Kulkarni (Counselor D)', action: 'ACCEPT_REQUEST_LOCK', entity: 'CallerRequest: req-201', ip: '192.168.1.45', time: '18 mins ago' },
    { id: '3', user: 'Prof. R. V. Patil (Registrar)', action: 'UPDATE_COURSE', entity: 'Course: B.Tech Intake', ip: '192.168.1.12', time: '1 hour ago' },
    { id: '4', user: 'Dr. S. K. Mehta (Main Admin)', action: 'CONFIGURE_WORKING_HOURS', entity: 'Weekly Schedule Mon-Sat', ip: '192.168.1.10', time: '3 hours ago' },
    { id: '5', user: 'Dr. S. K. Mehta (Main Admin)', action: 'PUBLISH_WORKFLOW', entity: 'Workflow: Admission Graph v2.4', ip: '192.168.1.10', time: 'Yesterday' }
  ];

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Logs & Compliance</h2>
        <p className="text-sm text-slate-500">
          Immutable audit trails of all administrative actions, school modifications, counselor acceptances, and telephony updates.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, or entity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{l.user}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{l.action}</td>
                  <td className="py-3 px-4 text-slate-600">{l.entity}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{l.ip}</td>
                  <td className="py-3 px-4 text-slate-500">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
