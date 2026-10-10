import React from 'react';
import renderIcon from './renderIcon';

const Card = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  footer, 
  className = '', 
  headerAction,
  grassHeader = true
}) => {
  return (
    <div className={`group relative bg-white dark:bg-[#071d15] border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm card-elevate-subtle hover:border-emerald-400 dark:hover:border-emerald-500/60 rounded-2xl overflow-hidden ${className}`}>
      
      {/* Top subtle pitch green accent line */}
      {grassHeader && (
        <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600 opacity-90" />
      )}

      {(title || subtitle || Icon || headerAction) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-emerald-950/80 flex items-center justify-between relative bg-slate-50/50 dark:bg-[#051710]/40">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                {renderIcon(Icon, 'h-5 w-5')}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}


      <div className="p-5 relative z-10">
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-[#04130d] border-t border-slate-100 dark:border-emerald-950/80 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
