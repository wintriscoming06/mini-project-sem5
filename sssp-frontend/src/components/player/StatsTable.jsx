import React from 'react';
export const StatsTable = ({ stats = [] }) => (
  <div className="grid grid-cols-3 gap-2">
    {stats.map((s, i) => (
      <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center">
        <span className="text-[10px] text-slate-400 block">{s.label}</span>
        <span className="text-xs font-black stat-number">{s.value}</span>
      </div>
    ))}
  </div>
);
export default StatsTable;
