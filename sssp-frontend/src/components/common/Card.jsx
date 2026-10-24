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
  grassHeader = true,
  accentHeader = true
}) => {
  const showHeaderBar = accentHeader && grassHeader;
  return (
    <div className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm card-elevate-subtle hover:border-blue-400/60 dark:hover:border-blue-500/50 rounded-2xl overflow-hidden ${className}`}>
      
      {/* Top subtle modern stadium cobalt accent line */}
      {showHeaderBar && (
        <div className="h-1 w-full bg-blue-600" />
      )}

      {(title || subtitle || Icon || headerAction) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between relative bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 group-hover:scale-105 transition-transform">
                {renderIcon(Icon, 'h-5 w-5')}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="p-5 relative z-10">
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
