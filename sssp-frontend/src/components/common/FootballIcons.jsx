import React from 'react';

/**
 * Classic 3D Stitched Soccer Match Ball with pentagonal patches, leather texture, and light reflection.
 */
export const ClassicSoccerBall = ({ className = "w-6 h-6", spinOnHover = false, ...props }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={`${className} ${spinOnHover ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`}
    aria-hidden="true"
    {...props}
  >
    <defs>
      <radialGradient id="ballShade" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="65%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </radialGradient>
      <linearGradient id="patchGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
    </defs>
    
    {/* Ball sphere */}
    <circle cx="50" cy="50" r="46" fill="url(#ballShade)" stroke="#0f172a" strokeWidth="2.5" />
    
    {/* Center pentagon */}
    <polygon points="50,32 64,43 59,59 41,59 36,43" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="2" />
    
    {/* Connecting seams to edges */}
    <line x1="50" y1="32" x2="50" y2="10" stroke="#0f172a" strokeWidth="2" />
    <line x1="64" y1="43" x2="84" y2="38" stroke="#0f172a" strokeWidth="2" />
    <line x1="59" y1="59" x2="74" y2="78" stroke="#0f172a" strokeWidth="2" />
    <line x1="41" y1="59" x2="26" y2="78" stroke="#0f172a" strokeWidth="2" />
    <line x1="36" y1="43" x2="16" y2="38" stroke="#0f172a" strokeWidth="2" />
    
    {/* Surrounding perimeter patches */}
    <polygon points="50,10 38,16 34,7 50,4" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />
    <polygon points="50,10 62,16 66,7 50,4" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />
    <polygon points="84,38 88,26 95,33 90,46" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />
    <polygon points="74,78 86,72 82,85 68,88" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />
    <polygon points="26,78 14,72 18,85 32,88" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />
    <polygon points="16,38 12,26 5,33 10,46" fill="url(#patchGrad)" stroke="#0f172a" strokeWidth="1.5" />

    {/* Light shine specular reflection */}
    <ellipse cx="36" cy="28" rx="14" ry="7" fill="white" opacity="0.35" transform="rotate(-20 36 28)" />
  </svg>
);

/**
 * Pitch emblem: a centre circle + halfway line. A calm, line-art football glyph that
 * inherits `currentColor` — used for empty states, tabs and generic placeholders.
 */
export const PitchEmblem = ({ className = "w-6 h-6", ...props }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <rect x="4" y="9" width="40" height="30" rx="3" opacity="0.55" />
    <line x1="24" y1="9" x2="24" y2="39" opacity="0.55" />
    <circle cx="24" cy="24" r="7" />
    <circle cx="24" cy="24" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const FootballIcon = PitchEmblem;

/**
 * Realistic Pitch Chalk Markings Overlay (Center circle, halfway line, penalty boxes, penalty arcs, corner arcs)
 */
export const PitchMarkings = ({ className = "absolute inset-0 pointer-events-none" }) => (
  <svg 
    viewBox="0 0 1200 600" 
    className={`w-full h-full ${className}`}
    preserveAspectRatio="none"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3.5"
    strokeOpacity="0.4"
  >
    {/* Outer touchline boundary */}
    <rect x="25" y="25" width="1150" height="550" rx="4" />
    
    {/* Halfway line */}
    <line x1="600" y1="25" x2="600" y2="575" />
    
    {/* Center Circle & Center Spot */}
    <circle cx="600" cy="300" r="85" />
    <circle cx="600" cy="300" r="5" fill="currentColor" fillOpacity="0.8" />
    
    {/* Left Penalty Area */}
    <rect x="25" y="145" width="180" height="310" />
    {/* Left Goal Area (6-yard box) */}
    <rect x="25" y="205" width="65" height="190" />
    {/* Left Penalty Spot */}
    <circle cx="135" cy="300" r="4.5" fill="currentColor" fillOpacity="0.8" />
    {/* Left Penalty Arc */}
    <path d="M 205,245 A 85,85 0 0,1 205,355" />
    
    {/* Right Penalty Area */}
    <rect x="995" y="145" width="180" height="310" />
    {/* Right Goal Area (6-yard box) */}
    <rect x="1110" y="205" width="65" height="190" />
    {/* Right Penalty Spot */}
    <circle cx="1065" cy="300" r="4.5" fill="currentColor" fillOpacity="0.8" />
    {/* Right Penalty Arc */}
    <path d="M 995,245 A 85,85 0 0,0 995,355" />
    
    {/* 4 Corner Arcs */}
    <path d="M 25,50 A 25,25 0 0,0 50,25" />
    <path d="M 1175,50 A 25,25 0 0,1 1150,25" />
    <path d="M 25,550 A 25,25 0 0,1 50,575" />
    <path d="M 1175,550 A 25,25 0 0,0 1150,575" />
  </svg>
);

/**
 * Grass Blades Row Accent (Used for borders of cards and hero sections)
 */
export const GrassBladesTrim = ({ className = "w-full h-4 text-emerald-600 dark:text-emerald-500 opacity-70" }) => (
  <svg viewBox="0 0 600 24" preserveAspectRatio="none" className={className} fill="currentColor">
    <path d="M0,24 L0,14 L12,4 L24,24 L36,8 L48,24 L60,2 L72,24 L84,10 L96,24 L108,6 L120,24 L132,12 L144,24 L156,4 L168,24 L180,8 L192,24 L204,2 L216,24 L228,10 L240,24 L252,6 L264,24 L276,12 L288,24 L300,4 L312,24 L324,8 L336,24 L348,2 L360,24 L372,10 L384,24 L396,6 L408,24 L420,12 L432,24 L444,4 L456,24 L468,8 L480,24 L492,2 L504,24 L516,10 L528,24 L540,6 L552,24 L564,12 L576,24 L588,4 L600,24 Z" />
  </svg>
);

/**
 * Corner Flag Icon
 */
export const CornerFlag = ({ className = "w-6 h-6", ...props }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} {...props}>
    <line x1="20" y1="12" x2="20" y2="56" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
    <polygon points="20,14 48,23 20,32" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
    <polygon points="20,14 34,18.5 20,23" fill="#facc15" />
    <circle cx="20" cy="56" r="4" fill="#64748b" />
  </svg>
);

export const ScoutTargetIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    stroke="currentColor" 
    className={className} 
    aria-hidden="true"
    {...props}
  >
    <circle cx="32" cy="32" r="23" strokeWidth="3" />
    <circle cx="32" cy="32" r="13" strokeWidth="3" />
    <circle cx="32" cy="32" r="4" fill="currentColor" />
  </svg>
);

export const StadiumIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    stroke="currentColor" 
    className={className} 
    aria-hidden="true"
    {...props}
  >
    <path d="M7 26Q32 8 57 26v26H7z" strokeWidth="3" />
    <path d="M14 31h36v13H14zM10 22h44M21 44v8M32 44v8M43 44v8" strokeWidth="3" />
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    stroke="currentColor" 
    className={className} 
    aria-hidden="true"
    {...props}
  >
    <path d="M22 10h20v12c0 10-5 17-10 17s-10-7-10-17z" strokeWidth="3" fill="#eab308" fillOpacity="0.2" />
    <path d="M22 16H10v7c0 7 6 11 13 11M42 16h12v7c0 7-6 11-13 11M32 39v13M19 55h26" strokeWidth="3" />
  </svg>
);

export const WhistleIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg 
    viewBox="0 0 64 64" 
    fill="none" 
    stroke="currentColor" 
    className={className} 
    aria-hidden="true"
    {...props}
  >
    <path d="M10 28h27c9 0 16 5 17 13H24c-8 0-14-5-14-13z" strokeWidth="3" fill="#10b981" fillOpacity="0.2" />
    <path d="M37 28V15h12v13M16 28V14h10v14" strokeWidth="3" />
  </svg>
);

export const PitchGridOverlay = ({ className = "absolute inset-0 pointer-events-none opacity-20" }) => (
  <div className={className} style={{
    backgroundImage: `url("/assets/design-system/patterns/pitch_grid.svg")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '400px 225px'
  }} />
);

export const TacticalBoardOverlay = ({ className = "absolute inset-0 pointer-events-none opacity-15" }) => (
  <div className={className} style={{
    backgroundImage: `url("/assets/design-system/patterns/tactical_arrows.svg")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '240px 140px'
  }} />
);

/**
 * Tournament Championship Grand Stadium Arena Overlay
 */
export const TournamentStadiumBackdrop = ({ className = "absolute inset-0 pointer-events-none" }) => (
  <svg 
    viewBox="0 0 1200 600" 
    className={`w-full h-full ${className}`}
    preserveAspectRatio="none"
    fill="none"
  >
    <defs>
      <linearGradient id="stadiumBeamLeft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="stadiumBeamRight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="stadiumCenterGlow" cx="50%" cy="0%" r="80%">
        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#052e16" stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Floodlight Beam Cones */}
    <polygon points="120,0 0,600 360,600" fill="url(#stadiumBeamLeft)" opacity="0.3" />
    <polygon points="1080,0 840,600 1200,600" fill="url(#stadiumBeamRight)" opacity="0.3" />
    <polygon points="600,0 180,600 1020,600" fill="url(#stadiumCenterGlow)" opacity="0.25" />
    {/* Stadium Grandstand silhouette tiers */}
    <path d="M 0,160 Q 600,220 1200,160 L 1200,240 Q 600,300 0,240 Z" fill="#041f14" opacity="0.7" />
    <path d="M 0,240 Q 600,300 1200,240 L 1200,320 Q 600,370 0,320 Z" fill="#02140d" opacity="0.85" />
  </svg>
);

// Backward-compatible safe fallbacks: prevent build breaks for components that imported removed gimmick icons
export const CoachWhistle = () => null;
export const TrainingCone = () => null;
export const SportyVelocityTracks = () => null;
export const KickingBall = ({ className = "w-4 h-4", ...props }) => (
  <ClassicSoccerBall className={className} {...props} />
);

