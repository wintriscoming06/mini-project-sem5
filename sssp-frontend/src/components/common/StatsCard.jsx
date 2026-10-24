import React from 'react';
import renderIcon from './renderIcon';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ClassicSoccerBall } from './FootballIcons';
import useCountUp from '../../hooks/useCountUp';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0, 850, 0);
  const displayValue = isNumeric ? animatedValue : value;
  const colorMap = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
    emerald: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
    green: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40'
  };

  const badgeClass = colorMap[color] || colorMap.blue;

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm card-elevate hover:border-blue-500/60 overflow-hidden cursor-default select-none">
      {/* Top subtle cobalt stadium accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white stat-number">
              {displayValue}
            </span>
            {trend && typeof trend === 'object' && (
              <span className={`inline-flex items-center text-xs font-bold ${trend.isUp ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {trend.isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {trend.value}
              </span>
            )}
            {trend && typeof trend === 'string' && (
              <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
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
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 flex-shrink-0 text-blue-600 dark:text-blue-400">
              <ClassicSoccerBall className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
