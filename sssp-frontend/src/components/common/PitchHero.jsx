import React from 'react';
import { PitchMarkings, GrassBladesTrim } from './FootballIcons';

/**
 * World-Class Stadium Pitch Hero Banner
 * Features alternating lawn mowed grass stripes, white chalk pitch lines,
 * and stadium floodlight beams.
 */
const PitchHero = ({ 
  title, 
  subtitle, 
  badgeText = "OFFICIAL MATCHDAY", 
  badgeColor = "emerald", 
  children, 
  stats = [], 
  actionButtons 
}) => {
  return (

    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 shadow-2xl pitch-turf-stripes text-white p-6 sm:p-8 mb-6">
      
      {/* Stadium Floodlights Glow from Top */}
      <div className="absolute -top-24 inset-x-0 h-64 pointer-events-none opacity-60 stadium-glow" />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-40 pitch-glow" />

      {/* Goal Net Background Texture */}
      <div className="absolute inset-0 goal-net-texture pointer-events-none opacity-30" />

      {/* Authentic White Chalk Pitch Lines */}
      <PitchMarkings className="absolute inset-0 opacity-45 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Side: Pitch Title & Branding */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md mb-3 text-xs font-black uppercase tracking-widest text-emerald-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-emerald-100/90 font-medium max-w-xl drop-shadow">
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
          <div className="flex items-center bg-emerald-950/75 border border-emerald-500/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 divide-x divide-emerald-800/60">
              {stats.map((s, idx) => (
                <div key={idx} className={idx > 0 ? "pl-4 text-left" : "text-left"}>
                  <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">{s.label}</div>
                  <div className="text-xl sm:text-2xl font-black text-white stat-number mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Lush Green Grass Blades Trim along the bottom of the Pitch Hero */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden pointer-events-none">
        <GrassBladesTrim className="w-full h-3.5 text-emerald-400/60" />
      </div>
    </div>
  );
};

export default PitchHero;
