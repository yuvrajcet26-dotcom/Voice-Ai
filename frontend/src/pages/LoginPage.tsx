import React, { useState } from 'react';
import {
  GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck,
  Building2, Sparkles, CheckCircle2, ChevronRight, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: (targetTab?: string) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToLanding }) => {
  const { loginAs } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<'admin' | 'registrar' | 'counselor'>('admin');
  const [email, setEmail] = useState('admin@svkm.ac.in');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);

  const [counselorLoginWay, setCounselorLoginWay] = useState<'email' | 'userid'>('email');
  const [selectedCounselorKey, setSelectedCounselorKey] = useState<string>('counselor_c');

  const handleRoleTabChange = (role: 'admin' | 'registrar' | 'counselor') => {
    setActiveRoleTab(role);
    if (role === 'admin') {
      setEmail('admin@svkm.ac.in');
      setPassword('Admin@123');
    } else if (role === 'registrar') {
      setEmail('registrar@svkm.ac.in');
      setPassword('Registrar@123');
    } else {
      selectCounselorPreset('counselor_c', counselorLoginWay);
    }
  };

  const selectCounselorPreset = (cKey: string, way: 'email' | 'userid') => {
    setSelectedCounselorKey(cKey);
    setCounselorLoginWay(way);
    setPassword('Counselor@123');

    const emailMap: Record<string, string> = {
      counselor_c: 'counselor.c@svkm.ac.in',
      counselor_a: 'anita.sharma@svkm.ac.in',
      counselor_b: 'bharat.dave@svkm.ac.in',
      counselor_d: 'deepali.wagh@svkm.ac.in',
      counselor_e: 'eknath.shinde@svkm.ac.in'
    };

    const idMap: Record<string, string> = {
      counselor_c: 'SNGU-CNS-STME-003',
      counselor_a: 'SNGU-CNS-STME-001',
      counselor_b: 'SNGU-CNS-STME-002',
      counselor_d: 'SNGU-CNS-STME-004',
      counselor_e: 'SNGU-CNS-STME-005'
    };

    if (way === 'email') {
      setEmail(emailMap[cKey] || 'counselor.c@svkm.ac.in');
    } else {
      setEmail(idMap[cKey] || 'SNGU-CNS-STME-003');
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginAs(email);
      if (activeRoleTab === 'registrar' || email.toLowerCase().includes('registrar') || email.toLowerCase().includes('reg')) {
        onSuccess('dashboard');
      } else if (activeRoleTab === 'counselor' || email.toLowerCase().includes('counselor') || email.toLowerCase().includes('cns') || email.toLowerCase().includes('sharma') || email.toLowerCase().includes('dave') || email.toLowerCase().includes('patil') || email.toLowerCase().includes('wagh') || email.toLowerCase().includes('shinde')) {
        onSuccess('counselor-portal');
      } else {
        onSuccess('dashboard');
      }
      setLoading(false);
    }, 300);
  };

  const handleQuickLogin = (roleKey: string, destTab: string) => {
    loginAs(roleKey);
    onSuccess(destTab);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mb-2"
        >
          ← Back to University Home
        </button>

        {/* SNGU Logo */}
        <div className="flex items-center justify-center">
          <img
            src="https://www.svkmnmimsgu.ac.in/images/sngu_logo_new.jpg"
            alt="SNGU Dhule Logo"
            className="h-16 w-auto object-contain rounded-xl border border-slate-100 shadow-md bg-white p-1"
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          SVKM NMIMS Global University (SNGU)
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Dhule Campus • Role-Based Access Control Authentication System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 space-y-6">
          
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Select Role to Authenticate:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition ${
                  activeRoleTab === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Main Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('registrar')}
                className={`py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition ${
                  activeRoleTab === 'registrar' ? 'bg-purple-600 text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Registrar</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('counselor')}
                className={`py-2 px-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition ${
                  activeRoleTab === 'counselor' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Counselor</span>
              </button>
            </div>
          </div>

          {/* Role Info Card */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            activeRoleTab === 'admin'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : activeRoleTab === 'registrar'
                ? 'bg-purple-50 border-purple-200 text-purple-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div>
              <p className="font-bold">
                {activeRoleTab === 'admin'
                  ? 'Main Admin (Dr. S. K. Mehta)'
                  : activeRoleTab === 'registrar'
                    ? 'University Registrar (Prof. R. V. Patil)'
                    : selectedCounselorKey === 'counselor_a' ? 'STME Counselor A (Prof. Anita Sharma)'
                    : selectedCounselorKey === 'counselor_b' ? 'STME Counselor B (Prof. Bharat Dave)'
                    : selectedCounselorKey === 'counselor_d' ? 'STME Counselor D (Prof. Deepali Wagh)'
                    : selectedCounselorKey === 'counselor_e' ? 'STME Counselor E (Prof. Eknath Shinde)'
                    : 'STME Counselor C (Prof. Chetan Patil)'}
              </p>
              <p className="text-[11px] opacity-80">
                {activeRoleTab === 'admin'
                  ? 'Full university access: Telephony, STME/SPTM/SOC schools, workflows, audit logs.'
                  : activeRoleTab === 'registrar'
                    ? 'Academic admissions governance: Seat matrix, CAP rounds, document verification & quotas.'
                    : 'Counselor terminal: 20s atomic incoming call alert, active call audio waveform, callbacks.'}
              </p>
            </div>
          </div>

          {/* Counselor Two-Way Login Options (When Counselor tab active) */}
          {activeRoleTab === 'counselor' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Two-Way Counselor Login Mode
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                  Dual Auth Active
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Sign in using either your <strong>Official Organization Email</strong> or <strong>User ID / Username</strong>:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectCounselorPreset(selectedCounselorKey, 'email')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    counselorLoginWay === 'email'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Way 1: Org Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => selectCounselorPreset(selectedCounselorKey, 'userid')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    counselorLoginWay === 'userid'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Way 2: User ID / Name</span>
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200/70">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1.5">
                  Select Counselor Terminal:
                </span>
                <div className="grid grid-cols-5 gap-1 text-center">
                  <button
                    type="button"
                    onClick={() => selectCounselorPreset('counselor_c', counselorLoginWay)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                      selectedCounselorKey === 'counselor_c' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Chetan (C)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCounselorPreset('counselor_a', counselorLoginWay)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                      selectedCounselorKey === 'counselor_a' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Anita (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCounselorPreset('counselor_b', counselorLoginWay)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                      selectedCounselorKey === 'counselor_b' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Bharat (B)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCounselorPreset('counselor_d', counselorLoginWay)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                      selectedCounselorKey === 'counselor_d' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Deepali (D)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCounselorPreset('counselor_e', counselorLoginWay)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                      selectedCounselorKey === 'counselor_e' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                    }`}
                  >
                    Eknath (E)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                {activeRoleTab === 'counselor' ? 'Official User ID / Organization Email / Username' : 'Email Address / User ID'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. counselor.c@svkm.ac.in or SNGU-CNS-STME-003"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50 text-slate-900 font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Demo: {password}</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50/50 text-slate-900 font-medium font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                activeRoleTab === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  : activeRoleTab === 'registrar'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <span>
                {loading ? 'Authenticating...' : `Sign In to ${
                  activeRoleTab === 'admin' ? 'Admin Dashboard' : activeRoleTab === 'registrar' ? 'Registrar Portal' : 'Counselor Terminal'
                }`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Persona Switcher */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>1-Click Persona Quick Login</span>
              </p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instant Switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'dashboard')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Main Admin</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dr. S. K. Mehta (Full Access)</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('registrar', 'dashboard')}
                className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Registrar</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Prof. R. V. Patil (Academics)</p>
                </div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('counselor_c', 'counselor-portal')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-100/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Counselor C (Chetan)</p>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">STME Pool • AVAILABLE</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Terminal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('counselor_d', 'counselor-portal')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-100/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Counselor D (Deepali)</p>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">STME Pool • AVAILABLE</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Terminal</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        © 2026 SVKM NMIMS Global University (SNGU), Dhule. Role-Based Access Control Architecture.
      </footer>
    </div>
  );
};

export default LoginPage;
