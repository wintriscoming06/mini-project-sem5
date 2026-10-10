import React from 'react';
import SVGRadarChart from '../auth/SVGRadarChart';

export const GpiBreakdown = ({ stats, score = 84.0 }) => (
  <div className="p-4 rounded-2xl bg-white dark:bg-[#071622] border border-slate-200 dark:border-emerald-950/40 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-black uppercase tracking-wider text-slate-400">GPI Polygon Radar</span>
      <span className="text-base font-black text-amber-400">{score}</span>
    </div>
    <SVGRadarChart stats={stats} />
  </div>
);
export default GpiBreakdown;
