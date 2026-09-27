import React, { useState, useEffect } from 'react';
import {
  Clock, Calendar, AlertCircle, CheckCircle2, Plus, Save,
  Trash2, Globe, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { WorkingHoursItem, HolidayItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const WorkingHours: React.FC = () => {
  const { role } = useAuth();
  const [hours, setHours] = useState<WorkingHoursItem[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [liveStatus, setLiveStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Holiday Modal
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    description: 'National / University Holiday'
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [hData, holData, sData] = await Promise.all([
        api.workingHours.list(),
        api.workingHours.getHolidays(),
        api.workingHours.status()
      ]);
      setHours(hData);
      setHolidays(holData);
      setLiveStatus(sData);
    } catch (e) {
      console.warn('Using default working hours data:', e);
      setHours([
        { id: '1', day_of_week: 0, day_name: 'Monday', start_time: '09:00', end_time: '17:30', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '2', day_of_week: 1, day_name: 'Tuesday', start_time: '09:00', end_time: '17:30', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '3', day_of_week: 2, day_name: 'Wednesday', start_time: '09:00', end_time: '17:30', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '4', day_of_week: 3, day_name: 'Thursday', start_time: '09:00', end_time: '17:30', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '5', day_of_week: 4, day_name: 'Friday', start_time: '09:00', end_time: '17:30', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '6', day_of_week: 5, day_name: 'Saturday', start_time: '09:00', end_time: '16:00', is_closed: false, timezone: 'Asia/Kolkata', active: true },
        { id: '7', day_of_week: 6, day_name: 'Sunday', start_time: '09:00', end_time: '17:30', is_closed: true, timezone: 'Asia/Kolkata', active: true }
      ]);
      setHolidays([
        { id: 'hol-1', name: 'Ganesh Chaturthi', date: '2026-09-14', description: 'Maharashtra State Festival', is_closed: true },
        { id: 'hol-2', name: 'Gandhi Jayanti', date: '2026-10-02', description: 'National Holiday', is_closed: true },
        { id: 'hol-3', name: 'Diwali (Laxmi Pujan)', date: '2026-11-08', description: 'Deepavali Festival', is_closed: true }
      ]);
      setLiveStatus({
        open: true,
        reason: 'normal_schedule',
        message: 'University is open (09:00 to 17:30 IST).',
        timezone: 'Asia/Kolkata',
        current_time_ist: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const sData = await api.workingHours.status();
      setLiveStatus(sData);
    } catch (e) {}
  };

  const handleHourChange = (idx: number, field: string, val: any) => {
    const updated = [...hours];
    (updated[idx] as any)[field] = val;
    setHours(updated);
  };

  const handleSaveHours = async () => {
    setIsSaving(true);
    try {
      await api.workingHours.update(hours);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadStatus();
    } catch (err: any) {
      alert(err.message || 'Failed to update working hours');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.workingHours.addHoliday(holidayForm);
      setIsHolidayModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      await api.workingHours.deleteHoliday(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove holiday');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Working Hours & Holiday Engine</h2>
          <p className="text-sm text-slate-500">
            Admissions schedule configured in <strong>Asia/Kolkata</strong> timezone. Controls whether calls can transfer to counselors or offer callback requests.
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Schedule Updated
          </span>
        )}
      </div>

      {/* Live Working Hours Status Banner */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        liveStatus?.open
          ? 'bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-emerald-800'
          : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base">
                Current Operational State: {liveStatus?.open ? 'OPEN FOR LIVE CALLS' : 'CLOSED / OUTSIDE WORKING HOURS'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                liveStatus?.open
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
              }`}>
                {liveStatus?.open ? 'Counselor Dispatch Active' : 'Callback Queue Active'}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-1">
              {liveStatus?.message || 'University admission office schedule evaluated.'}
            </p>
          </div>
        </div>

        <div className="text-right text-xs font-mono">
          <span className="text-white/60 block text-[10px]">TIMEZONE</span>
          <span className="font-bold text-white">Asia/Kolkata (IST)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Hours Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Admissions Hours</h3>
              <p className="text-xs text-slate-500">Regular working hours per day of the week.</p>
            </div>

            {role === 'MAIN_ADMIN' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveHours}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Weekly Schedule'}
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {hours.map((h, idx) => (
              <div
                key={h.day_of_week}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="w-32">
                  <span className="font-bold text-slate-800 text-xs">{h.day_name}</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.is_closed}
                      disabled={role !== 'MAIN_ADMIN'}
                      onChange={(e) => handleHourChange(idx, 'is_closed', e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-slate-600 font-medium">Closed</span>
                  </label>

                  {!h.is_closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.start_time}
                        disabled={role !== 'MAIN_ADMIN'}
                        onChange={(e) => handleHourChange(idx, 'start_time', e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={h.end_time}
                        disabled={role !== 'MAIN_ADMIN'}
                        onChange={(e) => handleHourChange(idx, 'end_time', e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                      />
                      <span className="text-[10px] text-slate-400 font-semibold">IST</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                      Admissions Office Closed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holiday Calendar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Holidays & Closures</h3>
              <p className="text-xs text-slate-500">Overrides normal working hours.</p>
            </div>

            {role === 'MAIN_ADMIN' && (
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(true)}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Add Holiday"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            {holidays.map(hol => (
              <div
                key={hol.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{hol.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{hol.date}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{hol.description}</p>
                </div>

                {role === 'MAIN_ADMIN' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteHoliday(hol.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add University Holiday</h3>
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra Day"
                  value={holidayForm.name}
                  onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date (YYYY-MM-DD) *</label>
                <input
                  type="date"
                  required
                  value={holidayForm.date}
                  onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={holidayForm.description}
                  onChange={e => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
