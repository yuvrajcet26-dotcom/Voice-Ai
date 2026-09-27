import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, AlertCircle, CheckCircle2, Clock, Building, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface IncomingRequestModalProps {
  request: {
    request_id: string;
    call_id?: string;
    caller_number: string;
    school: string;
    course: string;
    branch: string;
    language: string;
    expires_in_seconds?: number;
  } | null;
  onClose: () => void;
  onAccepted?: (requestId: string) => void;
}

export const IncomingRequestModal: React.FC<IncomingRequestModalProps> = ({ request, onClose, onAccepted }) => {
  const { user, updateCounselorState } = useAuth();
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAccepting, setIsAccepting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!request) return;
    setTimeLeft(request.expires_in_seconds || 20);
    setStatusMessage(null);
    setIsError(false);
    setIsLiveConnected(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatusMessage("Request timed out. Call forwarded to fallback queue.");
          setIsError(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [request]);

  // Live call timer
  useEffect(() => {
    let callTimer: any = null;
    if (isLiveConnected) {
      callTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [isLiveConnected]);

  if (!request) return null;

  const counselorId = user?.counselor?.counselor_id || user?.id || 'counselor-stme-c';

  const handleAccept = async () => {
    setIsAccepting(true);
    setStatusMessage("Acquiring atomic lock and initiating call transfer...");
    setIsError(false);

    try {
      const res = await api.requests.accept(request.request_id, counselorId);
      if (res.success) {
        setIsLiveConnected(true);
        updateCounselorState('BUSY');
        setStatusMessage("CONNECTED! Live call transferred to your mobile.");
        if (onAccepted) onAccepted(request.request_id);
      }
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err.message || "Failed to accept request. Another counselor may have accepted first.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await api.requests.decline(request.request_id, counselorId, "Counselor clicked decline");
    } catch (e) {
      console.error(e);
    }
    onClose();
  };

  const handleEndCall = async () => {
    if (request.call_id) {
      try {
        await api.calls.terminate(request.call_id);
      } catch (e) {
        console.error(e);
      }
    }
    updateCounselorState('AVAILABLE');
    setIsLiveConnected(false);
    onClose();
  };

  const progressPercent = (timeLeft / 20) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`p-5 text-white ${isLiveConnected ? 'bg-gradient-to-r from-emerald-600 to-teal-700' : 'bg-gradient-to-r from-blue-700 to-indigo-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {isLiveConnected ? (
                  <PhoneCall className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <Phone className="w-5 h-5 text-white animate-bounce" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {isLiveConnected ? 'Live Admission Call Active' : 'Incoming Admission Call Request'}
                </h3>
                <p className="text-xs text-white/80">SVKM Global University, Dhule</p>
              </div>
            </div>
            
            {!isLiveConnected && (
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              </div>
            )}
          </div>

          {/* Progress bar countdown */}
          {!isLiveConnected && (
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-400' : 'bg-amber-300'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Target School
              </span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{request.school || 'STME'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Course & Program
              </span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{request.course || 'B.Tech'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Specialization / Branch</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5">{request.branch || 'Electrical Engineering'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Caller Spoken Language</span>
              <p className="font-semibold text-slate-800 text-sm mt-0.5 uppercase tracking-wide text-blue-600">
                {request.language || 'English'}
              </p>
            </div>
          </div>

          {/* Caller Phone */}
          <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-sm">
            <span className="text-slate-600">Prospective Caller Phone:</span>
            <span className="font-mono font-bold text-slate-800">{request.caller_number}</span>
          </div>

          {/* Live Call Duration when connected */}
          {isLiveConnected && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Call Transferred To Mobile
              </span>
              <p className="text-2xl font-mono font-bold text-emerald-950">
                {Math.floor(callDuration / 60).toString().padStart(2, '0')}:
                {(callDuration % 60).toString().padStart(2, '0')}
              </p>
              <div className="flex items-center justify-center gap-1.5 py-1">
                <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-1" />
                <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-2" />
                <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-3" />
                <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-4" />
                <div className="w-1.5 bg-emerald-500 rounded-full animate-voice-5" />
              </div>
            </div>
          )}

          {/* Feedback/Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            {!isLiveConnected ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={timeLeft === 0 || isAccepting}
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-600/30 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
                >
                  <PhoneCall className="w-4 h-4" />
                  {isAccepting ? 'Locking Request...' : 'Accept Call'}
                </button>
                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={handleDecline}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
                >
                  <PhoneOff className="w-4 h-4 text-slate-500" />
                  Decline
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEndCall}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-rose-600/30"
              >
                <PhoneOff className="w-4 h-4" />
                End Call & Free Counselor Status
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
