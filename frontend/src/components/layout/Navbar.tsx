import React, { useState } from 'react';
import {
  GraduationCap, Phone, ShieldCheck, UserCheck, Bell, Radio,
  ChevronDown, Check, Sparkles, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CounselorState } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface NavbarProps {
  onOpenSimulator: () => void;
  onNavigateToHome?: () => void;
  onNavigateToLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSimulator, onNavigateToHome, onNavigateToLogin }) => {
  const { user, loginAs, logout, updateCounselorState } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStateMenu, setShowStateMenu] = useState(false);

  const counselorStates: CounselorState[] = ['AVAILABLE', 'BUSY', 'OFFLINE', 'ON_BREAK', 'DO_NOT_DISTURB'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: SVKM Brand */}
        <div 
          onClick={onNavigateToHome}
          className="flex items-center gap-3.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Return to SNGU Dhule Landing Page"
        >
          <img
            src="https://www.svkmnmimsgu.ac.in/images/sngu_logo_new.jpg"
            alt="SNGU Dhule Logo"
            className="h-10 w-auto object-contain rounded-lg border border-slate-100 shadow-sm bg-white p-0.5"
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                SVKM NMIMS GLOBAL UNIVERSITY
              </h1>
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                SNGU Dhule
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Multilingual Voice Admission & Intelligent Counselor Routing Platform
            </p>
          </div>
        </div>

        {/* Center / Right: Operational Status & Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Real-time System Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Exotel: <strong className="text-emerald-700">Live</strong></span>
            <span className="text-slate-300">|</span>
            <span>AI STT: <strong className="text-slate-800">Whisper-v3</strong></span>
            <span className="text-slate-300">|</span>
            <span>Lang: <strong className="text-blue-700">EN / HI / MR</strong></span>
          </div>

          {/* Call Simulator Trigger Button */}
          <button
            type="button"
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm hover:shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Interactive</span> Call Simulator
          </button>

          {/* Counselor Real-time State Toggle if user is Counselor */}
          {user?.counselor && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStateMenu(!showStateMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium transition-all shadow-sm"
              >
                <span className="text-slate-500 hidden sm:inline">My Status:</span>
                <StatusBadge status={user.counselor.current_state} showDot />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showStateMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-fadeIn">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Toggle Availability
                  </div>
                  {counselorStates.map(state => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => {
                        updateCounselorState(state);
                        setShowStateMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                    >
                      <StatusBadge status={state} showDot />
                      {user.counselor?.current_state === state && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 1-Click Role / Persona Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-medium"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold text-slate-800 leading-tight">{user?.name || 'Guest'}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Switch Persona (Interactive Testing)</p>
                  <p className="text-[11px] text-slate-500">Test different views & simultaneous counselor acceptances:</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { loginAs('admin'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Main Admin (Dr. S. K. Mehta)</p>
                      <p className="text-[10px] text-slate-500">Full university access to all modules</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loginAs('registrar'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <div>
                      <p className="font-semibold text-slate-800">Registrar (Prof. R. V. Patil)</p>
                      <p className="text-[10px] text-slate-500">Academic & school portal</p>
                    </div>
                  </button>

                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                    STME Counselors (School Pool)
                  </div>

                  <button
                    type="button"
                    onClick={() => { loginAs('counselor_c'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">Counselor C (Prof. Chetan)</p>
                      <p className="text-[10px] text-emerald-600">STME Pool • AVAILABLE</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">Avail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loginAs('counselor_d'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">Counselor D (Prof. Deepali)</p>
                      <p className="text-[10px] text-emerald-600">STME Pool • AVAILABLE</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">Avail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loginAs('counselor_e'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">Counselor E (Prof. Eknath)</p>
                      <p className="text-[10px] text-emerald-600">STME Pool • AVAILABLE</p>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">Avail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loginAs('counselor_a'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center justify-between opacity-80"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">Counselor A (Prof. Anita)</p>
                      <p className="text-[10px] text-amber-600">STME Pool • BUSY</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">Busy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { loginAs('counselor_b'); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center justify-between opacity-80"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">Counselor B (Prof. Bharat)</p>
                      <p className="text-[10px] text-amber-600">STME Pool • BUSY</p>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">Busy</span>
                  </button>
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onNavigateToHome) onNavigateToHome();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-2"
                    >
                      <span>🏠 University Landing Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        if (onNavigateToLogin) onNavigateToLogin();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                    >
                      <span>🚪 Logout / Switch Persona</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
