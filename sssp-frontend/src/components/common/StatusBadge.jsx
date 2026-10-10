import React from 'react';

const StatusBadge = ({ status, label }) => {
  const normalizedStatus = (status || '').toUpperCase();
  const displayLabel = label || (status ? status.toLowerCase() : 'Unknown');

  let colorClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (['ACTIVE', 'ACCEPTED', 'COMPLETED', 'APPROVED', 'FULL', 'HIGH'].includes(normalizedStatus)) {
    colorClasses = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (['LIVE'].includes(normalizedStatus)) {
    colorClasses = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 animate-pulse';
  } else if (['PENDING', 'ONGOING', 'SCHEDULED', 'PROVISIONAL', 'MEDIUM'].includes(normalizedStatus)) {
    colorClasses = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (['REJECTED', 'CANCELLED', 'LOW'].includes(normalizedStatus)) {
    colorClasses = 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  } else if (['INFO', 'PUBLIC'].includes(normalizedStatus)) {
    colorClasses = 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
  } else if (['PRIVATE'].includes(normalizedStatus)) {
    colorClasses = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      {normalizedStatus === 'LIVE' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-ping" />
      )}
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
