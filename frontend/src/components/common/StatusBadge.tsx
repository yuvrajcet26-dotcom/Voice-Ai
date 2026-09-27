import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showDot = true }) => {
  const norm = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm === 'AVAILABLE' || norm === 'PUBLISHED' || norm === 'ACTIVE' || norm === 'CONNECTED') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'BUSY' || norm === 'WAITING_FOR_ACCEPTANCE' || norm === 'PENDING' || norm === 'REVIEW') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500 animate-ping';
  } else if (norm === 'OFFLINE' || norm === 'ARCHIVED' || norm === 'INACTIVE') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
    dotColor = 'bg-slate-400';
  } else if (norm === 'ON_BREAK' || norm === 'APPROVED') {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (norm === 'DO_NOT_DISTURB' || norm === 'FAILED' || norm === 'TRANSFER_FAILED') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (norm === 'CALLBACK_REQUIRED' || norm === 'CALLBACK') {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {status.replace(/_/g, ' ')}
    </span>
  );
};
