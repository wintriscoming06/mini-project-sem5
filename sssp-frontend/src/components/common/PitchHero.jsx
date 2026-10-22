import React from 'react';

const PitchHero = ({ 
  title, 
  subtitle, 
  badgeText = "Overview", 
  children, 
  stats = [], 
  actionButtons 
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-8 mb-6">

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Pitch Title & Branding */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 backdrop-blur-md mb-3 text-xs font-black uppercase tracking-widest text-blue-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-slate-300 font-medium max-w-xl">
              {subtitle}
            </p>
          )}

          {/* Optional Embedded Content / Sub-header */}
          {children && <div className="mt-4">{children}</div>}

          {/* Action buttons */}
          {actionButtons && (
            <div className="flex flex-wrap items-center gap-3 mt-5">
              {actionButtons}
            </div>
          )}
        </div>

        {/* Right Side: Quick Stats Column if provided */}
        {stats.length > 0 && (
          <div className="flex items-center bg-white/10 dark:bg-black/30 border border-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 divide-x divide-white/10">
              {stats.map((s, idx) => (
                <div key={idx} className={idx > 0 ? "pl-4 text-left" : "text-left"}>
                  <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">{s.label}</div>
                  <div className="text-xl sm:text-2xl font-black text-white stat-number mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom subtle modern hairline accent */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden pointer-events-none">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
      </div>
    </div>
  );
};

export default PitchHero;
