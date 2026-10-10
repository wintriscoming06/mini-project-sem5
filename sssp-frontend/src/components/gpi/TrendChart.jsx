import React from 'react';
import { TrendingUp } from 'lucide-react';

export const TrendChart = ({ history = [] }) => (
  <div className="p-4 rounded-2xl bg-white dark:bg-[#071622] border border-slate-200 dark:border-emerald-950/40">
    <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-2">
      <TrendingUp className="w-4 h-4 text-emerald-400" />
      <span>Performance Evolution</span>
    </div>
    <div className="h-16 flex items-end gap-2 pt-2">
      {[78, 80, 82, 83, 85].map((val, i) => (
        <div key={i} className="flex-1 bg-emerald-500/30 rounded-t" style={{ height: `${(val - 70) * 6}%` }} />
      ))}
    </div>
  </div>
);
export default TrendChart;
