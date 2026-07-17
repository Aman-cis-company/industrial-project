import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (statusVal) => {
    const s = String(statusVal).trim().toLowerCase();
    
    switch (s) {
      case 'on track':
      case 'on_track':
      case 'active':
      case 'approved':
        return {
          text: 'On Track',
          classes: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
        };
      case 'at risk':
      case 'at_risk':
      case 'pending':
      case 'under negotiation':
      case 'under_negotiation':
      case 'sent':
      case 'under review':
      case 'under_review':
        return {
          text: statusVal,
          classes: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
        };
      case 'delayed':
      case 'critical':
      case 'rejected':
      case 'lost':
        return {
          text: statusVal,
          classes: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
        };
      case 'completed':
      case 'won':
      case 'closed':
      case 'mitigated':
        return {
          text: statusVal,
          classes: 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/30'
        };
      default:
        return {
          text: statusVal,
          classes: 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/30'
        };
    }
  };

  const config = getStatusStyles(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full select-none ${config.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {config.text}
    </span>
  );
};

export default StatusBadge;
