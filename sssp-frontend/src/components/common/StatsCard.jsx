import React from 'react';
import renderIcon from './renderIcon';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ClassicSoccerBall } from './FootballIcons';
import useCountUp from '../../hooks/useCountUp';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0, 850, 0);
  const displayValue = isNumeric ? animatedValue : value;
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
    green: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30',
    blue: 'text-sky-500 bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/30',
    purple: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/30',
    amber: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30',
    yellow: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30',
    red: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30'
  };

  const badgeClass = colorMap[color] || colorMap.emerald;

  return (
    <div className="group relative bg-white dark:bg-[#071d15] border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-5 shadow-sm card-elevate hover:border-emerald-500/80 overflow-hidden cursor-default select-none">
      {/* Top pitch lawn grass stripe */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-500" />
      
      {/* Background soccer net subtle pattern */}
      <div className="absolute inset-0 goal-net-texture pointer-events-none opacity-40 dark:opacity-20" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-black text-slate-500 dark:text-emerald-200/70 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white stat-number">
              {displayValue}
            </span>
            {trend && typeof trend === 'object' && (
              <span className={`inline-flex items-center text-xs font-bold ${trend.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {trend.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {trend.value}
              </span>
            )}
            {trend && typeof trend === 'string' && (
              <span className="text-xs text-slate-400 dark:text-emerald-300/60 font-medium">
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div className="relative flex items-center justify-center">
          {Icon ? (
            <div className={`p-3 rounded-xl border ${badgeClass} flex-shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
              {renderIcon(Icon, 'h-6 w-6')}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex-shrink-0">
              <ClassicSoccerBall className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StatsCard;
