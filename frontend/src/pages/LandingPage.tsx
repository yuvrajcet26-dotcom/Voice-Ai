import React from 'react';
import {
  GraduationCap, Phone, PhoneCall, Radio, Globe, ShieldCheck,
  Building2, BookOpen, Users, Clock, ArrowRight, Sparkles, CheckCircle2,
  ChevronRight, Award, MessageSquare, Headphones
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onOpenSimulator: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenSimulator }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white py-2 px-4 text-center text-xs font-medium border-b border-blue-800">
        <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider mr-2">
          New
        </span>
        SVKM Global University, Dhule — AI-Powered Multilingual Admission & Telephone Routing Platform Live
      </div>

      {/* Hero Header Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="https://www.svkmnmimsgu.ac.in/images/sngu_logo_new.jpg"
              alt="SNGU Dhule Logo"
              className="h-12 w-auto object-contain rounded-lg border border-slate-100 shadow-sm bg-white p-0.5"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-950 tracking-tight text-lg sm:text-xl">
                  SVKM NMIMS GLOBAL UNIVERSITY
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                  SNGU Dhule
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Shri Vile Parle Kelavani Mandal • Approved by UGC & Govt. of Maharashtra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSimulator}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all border border-blue-200"
            >
              <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Voice Call Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              <span>Staff & Counselor Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Next-Generation AI Telephony Voice Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Real-Time Voice Admission & Intelligent Counselor Dispatch
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                Students and parents can call the official university virtual number and have natural, verified voice conversations in <strong className="text-slate-900">English, Hindi, and Marathi</strong>. Queries are answered instantly with verified university data, and callers are intelligently transferred to active school counselors via atomic first-acceptance locking.
              </p>

              {/* Virtual Telephone Number Highlight Card */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <PhoneCall className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Official University Virtual Number (ExoPhone)
                    </span>
                    <span className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
                      +91 2562 281456
                    </span>
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live • Auto-Attendant • Multilingual Voicebot Ready
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenSimulator}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Test Voice Call Now</span>
                </button>
              </div>

              {/* Supported Languages & Accents */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" /> Supported Languages:
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold shadow-sm">
                  English (Indian English)
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold shadow-sm text-blue-700">
                  हिंदी (Hindi)
                </span>
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 font-semibold shadow-sm text-indigo-700">
                  मराठी (Marathi)
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-semibold text-blue-800">
                  Mixed / Hinglish / Marathlish
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Highlights Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">SVKM Global University Architecture</h3>
                      <p className="text-[11px] text-slate-500">Dhule Campus Operational Overview</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                {/* 3 Pillars */}
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">Dynamic Academic Hierarchy</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Schools (STME, SOC, SPO), Courses (B.Tech, BBA, B.Pharm) & Branches managed in database without hardcoded code.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Users className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">Intelligent Counselor Dispatch</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        School-specific counselor pools (A, B, C, D, E) with atomic first-acceptance locking and 20s timeout failover.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900">Timezone Working Hours Engine</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Asia/Kolkata university schedule. Outside hours automatically records priority callback requests.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Portal Access Quick Buttons */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="p-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-bold text-center transition-all"
                  >
                    Admin Dashboard →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('counselor-portal')}
                    className="p-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-center transition-all"
                  >
                    Counselor Portal →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initial Schools Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Academic Schools & Colleges
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
              Constituent Schools at SVKM Dhule Campus
            </h2>
            <p className="text-sm text-slate-500">
              Inquiries for any of these schools are dynamically identified and dispatched to their respective counselor pools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* STME */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-600/20">
                    STME
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-full">
                    Engineering
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  School of Technology Management & Engineering
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  B.Tech programs in Computer Engineering, Information Technology, Electrical Engineering, Mechanical Engineering, and AI & Data Science.
                </p>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <p>👥 <strong>5 Dedicated Counselors:</strong> A, B, C, D, E</p>
                  <p>💰 <strong>Fees:</strong> ₹ 1,80,000 / year</p>
                  <p>🎓 <strong>Entrance:</strong> MHT-CET / JEE Main</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('schools')}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs border border-slate-200 transition-all text-center mt-4"
              >
                View STME Details
              </button>
            </div>

            {/* SOC */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-purple-600/20">
                    SOC
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-full">
                    Commerce
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  School of Commerce
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Undergraduate and postgraduate business programs including Bachelor of Business Administration (BBA), B.Com (Hons), and MBA.
                </p>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <p>👥 <strong>Counselor Lead:</strong> Dr. Sunita Jain</p>
                  <p>💰 <strong>Fees:</strong> ₹ 1,10,000 / year</p>
                  <p>🎓 <strong>Eligibility:</strong> 10+2 with min 50%</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('schools')}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-purple-600 hover:text-white text-slate-700 font-bold text-xs border border-slate-200 transition-all text-center mt-4"
              >
                View SOC Details
              </button>
            </div>

            {/* SPO */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                    SPO
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                    Pharmacy
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  School of Pharmacy & Technology Management
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PCI & AICTE approved pharmaceutical education offering Bachelor of Pharmacy (B.Pharm) and Diploma in Pharmacy (D.Pharm).
                </p>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                  <p>👥 <strong>Counselor Lead:</strong> Dr. Milind Joshi</p>
                  <p>💰 <strong>Fees:</strong> ₹ 1,50,000 / year</p>
                  <p>🎓 <strong>Eligibility:</strong> 10+2 with PCB/PCM</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('schools')}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs border border-slate-200 transition-all text-center mt-4"
              >
                View SPO Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-white text-sm">SVKM Global University, Dhule</h4>
            <p className="text-slate-400">Campus Address: Behind Gurudwara, Mumbai-Agra Highway, Dhule, Maharashtra 424001</p>
            <p className="text-slate-500 text-[11px]">AI-Powered Voice Telephony & Counselor Dispatch Infrastructure</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-white hover:text-blue-400 font-semibold"
            >
              Staff Login
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={onOpenSimulator}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Call Simulator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
