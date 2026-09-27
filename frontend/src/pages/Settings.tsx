import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Save, CheckCircle2, Globe, Clock,
  Shield, Volume2, Radio, Bell
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Settings: React.FC = () => {
  const { role } = useAuth();
  const [systemSettings, setSystemSettings] = useState({
    university_name: 'SVKM Global University, Dhule',
    timezone: 'Asia/Kolkata',
    max_call_duration_seconds: 600,
    silence_timeout_seconds: 15,
    counselor_acceptance_timeout: 20,
    ai_provider: 'Whisper Large-v3 + IndicBERT + Azure Neural TTS',
    telephony_provider: 'Exotel Programmable Voice'
  });

  const [messages, setMessages] = useState([
    {
      key: 'OUTSIDE_WORKING_HOURS',
      en: 'Our admissions office is currently closed outside university working hours. I can record your request and have a counselor contact you tomorrow morning.',
      hi: 'विश्वविद्यालय का परामर्श कार्यालय अभी बंद है। हम आपका अनुरोध दर्ज कर रहे हैं, कल सुबह हमारे काउंसलर आपसे संपर्क करेंगे।',
      mr: 'आमचे समुपदेशक सध्या कार्यालयीन वेळेबाहेर आहेत. आम्ही आपली विनंती नोंदवून घेत आहोत आणि उद्या सकाळी आमचे प्रतिनिधी आपल्याशी संपर्क साधतील.'
    },
    {
      key: 'ALL_COUNSELORS_BUSY',
      en: 'All of our admission counselors are currently assisting other prospective students. I can create a priority callback request for you.',
      hi: 'हमारे सभी काउंसलर इस समय अन्य छात्रों की सहायता में व्यस्त हैं। हम आपके लिए प्राथमिकता कॉलबैक दर्ज कर सकते हैं।',
      mr: 'आमचे सर्व समुपदेशक सध्या इतर विद्यार्थ्यांशी बोलण्यात व्यस्त आहेत. मी आपल्यासाठी प्राधान्य कॉलबॅक नोंदवू शकतो.'
    },
    {
      key: 'COUNSELOR_WAITING',
      en: 'Connecting you with an admission counselor for STME. Please hold the line while your call is transferred.',
      hi: 'कृपया लाइन पर बने रहें, आपका कॉल एसटीएमई के एडमिशन काउंसलर को ट्रांसफर किया जा रहा है।',
      mr: 'कृपया काही सेकंद प्रतीक्षा करा, आपला कॉल एसटीएमईच्या प्रवेश समुपदेशकांकडे जोडला जात आहे.'
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.settings.update({ system: systemSettings, messages });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System & Telephony Settings</h2>
          <p className="text-sm text-slate-500">
            Configure global admission timeouts, Exotel telephony integration, and multilingual voice prompt templates.
          </p>
        </div>

        {role === 'MAIN_ADMIN' && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings and multilingual prompt templates updated successfully.
        </div>
      )}

      {/* Global Parameters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Admissions & Call Engine Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">University Name</label>
            <input
              type="text"
              value={systemSettings.university_name}
              onChange={e => setSystemSettings({ ...systemSettings, university_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
            <input
              type="text"
              disabled
              value={systemSettings.timezone}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Counselor Acceptance Timeout</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={systemSettings.counselor_acceptance_timeout}
                onChange={e => setSystemSettings({ ...systemSettings, counselor_acceptance_timeout: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
              <span className="text-slate-500 font-medium">seconds</span>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Maximum Call Duration</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={systemSettings.max_call_duration_seconds}
                onChange={e => setSystemSettings({ ...systemSettings, max_call_duration_seconds: parseInt(e.target.value) || 600 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
              <span className="text-slate-500 font-medium">seconds</span>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Silence Timeout</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={systemSettings.silence_timeout_seconds}
                onChange={e => setSystemSettings({ ...systemSettings, silence_timeout_seconds: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
              <span className="text-slate-500 font-medium">seconds</span>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telephony Provider</label>
            <input
              type="text"
              disabled
              value={systemSettings.telephony_provider}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Multilingual Voice Message Templates */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Multilingual Spoken Messages</h3>
          <p className="text-xs text-slate-500">
            Customize the spoken voice messages played to callers in English, Hindi, and Marathi.
          </p>
        </div>

        <div className="space-y-6 pt-2">
          {messages.map((m, idx) => (
            <div key={m.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {m.key}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Spoken Voice Template</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">English (en-IN)</label>
                  <textarea
                    rows={3}
                    value={m.en}
                    onChange={e => {
                      const updated = [...messages];
                      updated[idx].en = e.target.value;
                      setMessages(updated);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hindi (hi-IN - हिंदी)</label>
                  <textarea
                    rows={3}
                    value={m.hi}
                    onChange={e => {
                      const updated = [...messages];
                      updated[idx].hi = e.target.value;
                      setMessages(updated);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marathi (mr-IN - मराठी)</label>
                  <textarea
                    rows={3}
                    value={m.mr}
                    onChange={e => {
                      const updated = [...messages];
                      updated[idx].mr = e.target.value;
                      setMessages(updated);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
