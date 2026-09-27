import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { CallSimulator } from './pages/CallSimulator';
import { CounselorPortal } from './pages/CounselorPortal';
import { Schools } from './pages/Schools';
import { Courses } from './pages/Courses';
import { Branches } from './pages/Branches';
import { Counselors } from './pages/Counselors';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Faqs } from './pages/Faqs';
import { PhoneNumbers } from './pages/PhoneNumbers';
import { Calls } from './pages/Calls';
import { Requests } from './pages/Requests';
import { WorkingHours } from './pages/WorkingHours';
import { Notifications } from './pages/Notifications';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';
import { IncomingRequestModal } from './components/common/IncomingRequestModal';
import { wsClient } from './services/websocket';

const MainAppContent: React.FC = () => {
  const { user, role } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeRequestModal, setActiveRequestModal] = useState<any | null>(null);

  // If user is a Counselor, set default view to CounselorPortal
  useEffect(() => {
    if (role === 'COUNSELOR') {
      setCurrentTab('counselor-portal');
    } else {
      setCurrentTab('dashboard');
    }
  }, [role]);

  // Connect WebSocket for real-time counselor alerts
  useEffect(() => {
    if (currentView !== 'app') return;

    const counselorId = user?.counselor?.counselor_id || user?.id;
    wsClient.connect(user?.role === 'COUNSELOR' ? 'counselor' : 'dashboard', counselorId);

    const unsubscribe = wsClient.on('NEW_COUNSELOR_REQUEST', (data: any) => {
      // If counselor is eligible and AVAILABLE, pop up request modal!
      if (user?.role === 'COUNSELOR' && user.counselor?.current_state === 'AVAILABLE') {
        setActiveRequestModal(data);
      }
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, [user, currentView]);

  // If viewing Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onNavigate={(page) => {
          if (page === 'login') setCurrentView('login');
          else if (page === 'dashboard') setCurrentView('app');
          else if (page === 'counselor-portal') {
            setCurrentTab('counselor-portal');
            setCurrentView('app');
          }
        }}
        onOpenSimulator={() => {
          setCurrentTab('simulator');
          setCurrentView('app');
        }}
      />
    );
  }

  // If viewing Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={(targetTab) => {
          if (targetTab) setCurrentTab(targetTab);
          setCurrentView('app');
        }}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'simulator':
        return <CallSimulator />;
      case 'counselor-portal':
        return <CounselorPortal />;
      case 'schools':
        return <Schools />;
      case 'courses':
        return <Courses />;
      case 'branches':
        return <Branches />;
      case 'counselors':
        return <Counselors />;
      case 'workflows':
        return <WorkflowBuilder />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'faqs':
        return <Faqs />;
      case 'phone-numbers':
        return <PhoneNumbers />;
      case 'calls':
        return <Calls />;
      case 'requests':
        return <Requests />;
      case 'working-hours':
        return <WorkingHours />;
      case 'notifications':
        return <Notifications />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenSimulator={() => setCurrentTab('simulator')}
        onNavigateToHome={() => setCurrentView('landing')}
        onNavigateToLogin={() => setCurrentView('login')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-12">
          {renderContent()}
        </main>
      </div>

      {/* Global Real-time Counselor Request Modal */}
      {activeRequestModal && (
        <IncomingRequestModal
          request={activeRequestModal}
          onClose={() => setActiveRequestModal(null)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
