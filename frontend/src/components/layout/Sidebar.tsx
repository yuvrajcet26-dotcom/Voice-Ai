import React from 'react';
import {
  LayoutDashboard, Building2, BookOpen, GitFork, Users, Network,
  BookText, HelpCircle, PhoneCall, History, PhoneIncoming, Clock,
  BellRing, BarChart3, Settings, ShieldAlert, Radio, UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { role } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'simulator', label: 'Interactive Voice Simulator', icon: Radio, highlight: true, roles: ['MAIN_ADMIN', 'REGISTRAR', 'COUNSELOR'] },
    { id: 'counselor-portal', label: 'Counselor Live Portal', icon: UserCheck, badge: 'Live Calls', roles: ['MAIN_ADMIN', 'COUNSELOR'] },
    
    // Academic Hierarchy
    { id: 'schools', label: 'Schools Management', icon: Building2, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'courses', label: 'Courses', icon: BookOpen, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'branches', label: 'Branches', icon: GitFork, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    
    // Counselors & Flow
    { id: 'counselors', label: 'Counselor Pools', icon: Users, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'workflows', label: 'Workflow Builder', icon: Network, roles: ['MAIN_ADMIN'] },
    
    // Knowledge & Voice
    { id: 'knowledge', label: 'Knowledge Base', icon: BookText, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'faqs', label: 'Multilingual FAQs', icon: HelpCircle, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'phone-numbers', label: 'Virtual Phone Numbers', icon: PhoneCall, roles: ['MAIN_ADMIN'] },
    
    // Operations & History
    { id: 'calls', label: 'Call Sessions & Logs', icon: History, roles: ['MAIN_ADMIN', 'REGISTRAR', 'COUNSELOR'] },
    { id: 'requests', label: 'Counselor Requests', icon: PhoneIncoming, roles: ['MAIN_ADMIN', 'REGISTRAR', 'COUNSELOR'] },
    { id: 'working-hours', label: 'Working Hours & Holidays', icon: Clock, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'notifications', label: 'Multi-Channel Alerts', icon: BellRing, roles: ['MAIN_ADMIN'] },
    
    // Reports & Security
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, roles: ['MAIN_ADMIN', 'REGISTRAR'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['MAIN_ADMIN'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert, roles: ['MAIN_ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {role === 'MAIN_ADMIN' ? 'University Administration' : role === 'REGISTRAR' ? 'Registrar Portal' : 'Counselor Terminal'}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : item.highlight
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/60'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !item.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* University footer branding */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center">
        <p className="text-[11px] font-semibold text-slate-400">SVKM Global University</p>
        <p className="text-[10px] text-slate-500">Dhule Campus, Maharashtra</p>
      </div>
    </aside>
  );
};
