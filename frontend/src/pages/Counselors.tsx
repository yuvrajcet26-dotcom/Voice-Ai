import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Phone, Mail, Building, Plus, CheckCircle,
  Clock, ShieldAlert, Sparkles, Filter, Search, ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { Counselor, School, CounselorState } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Counselors: React.FC = () => {
  const { role } = useAuth();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolFilter, setSchoolFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000); // Polling for real-time status updates
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [cData, sData] = await Promise.all([api.counselors.list(), api.schools.list()]);
      setCounselors(cData);
      setSchools(sData);
    } catch (e) {
      console.warn('Using default counselor data:', e);
      setCounselors([
        {
          id: 'counselor-stme-a',
          user_id: 'user-counselor-a',
          name: 'Prof. Anita Sharma',
          email: 'counselor.a@svkm.ac.in',
          phone_number: '+91 9820011001',
          designation: 'Senior Admission Counselor',
          status: 'ACTIVE',
          current_state: 'BUSY',
          assignments: [
            { id: 'as-1', school_id: 'school-stme', school_code: 'STME', school_name: 'School of Technology Management & Engineering', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-stme-b',
          user_id: 'user-counselor-b',
          name: 'Prof. Bharat Patil',
          email: 'counselor.b@svkm.ac.in',
          phone_number: '+91 9820011002',
          designation: 'Admission Counselor',
          status: 'ACTIVE',
          current_state: 'BUSY',
          assignments: [
            { id: 'as-2', school_id: 'school-stme', school_code: 'STME', school_name: 'School of Technology Management & Engineering', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-stme-c',
          user_id: 'user-counselor-c',
          name: 'Prof. Chetan Deshmukh',
          email: 'counselor.c@svkm.ac.in',
          phone_number: '+91 9820011003',
          designation: 'Admission Officer',
          status: 'ACTIVE',
          current_state: 'AVAILABLE',
          assignments: [
            { id: 'as-3', school_id: 'school-stme', school_code: 'STME', school_name: 'School of Technology Management & Engineering', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-stme-d',
          user_id: 'user-counselor-d',
          name: 'Prof. Deepali Kulkarni',
          email: 'counselor.d@svkm.ac.in',
          phone_number: '+91 9820011004',
          designation: 'Admission Counselor',
          status: 'ACTIVE',
          current_state: 'AVAILABLE',
          assignments: [
            { id: 'as-4', school_id: 'school-stme', school_code: 'STME', school_name: 'School of Technology Management & Engineering', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-stme-e',
          user_id: 'user-counselor-e',
          name: 'Prof. Eknath Shinde',
          email: 'counselor.e@svkm.ac.in',
          phone_number: '+91 9820011005',
          designation: 'Admission Counselor',
          status: 'ACTIVE',
          current_state: 'AVAILABLE',
          assignments: [
            { id: 'as-5', school_id: 'school-stme', school_code: 'STME', school_name: 'School of Technology Management & Engineering', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-soc-1',
          user_id: 'user-counselor-soc-1',
          name: 'Dr. Sunita Jain',
          email: 'counselor.soc@svkm.ac.in',
          phone_number: '+91 9820011006',
          designation: 'Commerce Admission Lead',
          status: 'ACTIVE',
          current_state: 'AVAILABLE',
          assignments: [
            { id: 'as-6', school_id: 'school-soc', school_code: 'SOC', school_name: 'School of Commerce', priority: 1, active: true }
          ]
        },
        {
          id: 'counselor-spo-1',
          user_id: 'user-counselor-spo-1',
          name: 'Dr. Milind Joshi',
          email: 'counselor.spo@svkm.ac.in',
          phone_number: '+91 9820011007',
          designation: 'Pharmacy Admission Head',
          status: 'ACTIVE',
          current_state: 'AVAILABLE',
          assignments: [
            { id: 'as-7', school_id: 'school-spo', school_code: 'SPO', school_name: 'School of Pharmacy & Technology Management', priority: 1, active: true }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (counselorId: string, newState: CounselorState) => {
    try {
      await api.counselors.updateAvailability(counselorId, newState);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update state');
    }
  };

  const filtered = counselors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone_number.includes(searchTerm);
    const matchesState = stateFilter === 'ALL' || c.current_state === stateFilter;
    const matchesSchool = schoolFilter === 'ALL' || c.assignments.some(a => a.school_id === schoolFilter || a.school_code === schoolFilter);

    return matchesSearch && matchesState && matchesSchool;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">School-Specific Counselor Pools</h2>
          <p className="text-sm text-slate-500">
            Real-time availability status, telephone numbers, and assignments across STME, SOC, and SPO.
          </p>
        </div>

        {/* Real-time pool summary */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Available: {counselors.filter(c => c.current_state === 'AVAILABLE').length}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Busy: {counselors.filter(c => c.current_state === 'BUSY').length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search counselor name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <select
            value={schoolFilter}
            onChange={(e) => setSchoolFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All Schools (STME / SOC / SPO)</option>
            <option value="STME">STME (Engineering Pool)</option>
            <option value="SOC">SOC (Commerce Pool)</option>
            <option value="SPO">SPO (Pharmacy Pool)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
          >
            <option value="ALL">All States</option>
            <option value="AVAILABLE">AVAILABLE (Will receive calls)</option>
            <option value="BUSY">BUSY (Skipped in dispatch)</option>
            <option value="OFFLINE">OFFLINE</option>
            <option value="ON_BREAK">ON BREAK</option>
          </select>
        </div>
      </div>

      {/* Counselors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(counselor => {
          const isStme = counselor.assignments.some(a => a.school_code === 'STME');

          return (
            <div
              key={counselor.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{counselor.name}</h3>
                    <p className="text-xs text-slate-500">{counselor.designation}</p>
                  </div>
                  <StatusBadge status={counselor.current_state} />
                </div>

                {/* Assignments */}
                <div className="flex flex-wrap gap-1.5 my-2">
                  {counselor.assignments.map(a => (
                    <span
                      key={a.id}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100"
                    >
                      {a.school_code || 'SVKM'} Pool (Priority {a.priority})
                    </span>
                  ))}
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-800 font-medium">{counselor.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{counselor.email}</span>
                  </div>
                </div>
              </div>

              {/* State Switcher Dropdown */}
              {(role === 'MAIN_ADMIN' || role === 'REGISTRAR') && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500">Live Status:</span>
                  <select
                    value={counselor.current_state}
                    onChange={(e) => handleStateChange(counselor.id, e.target.value as CounselorState)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="ON_BREAK">ON BREAK</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="DO_NOT_DISTURB">DND</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
