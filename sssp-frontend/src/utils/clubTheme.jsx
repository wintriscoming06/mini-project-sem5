import React from 'react';

/**
 * Curated Premier Clubs & Academies
 * Each club includes authentic brand colors, stadium tone gradients, and SVG crest badge.
 */
export const PRESET_CLUBS = [
  {
    id: 'free_agent',
    name: 'Free Agent',
    short: 'FA',
    aliases: ['free agent', 'none', 'unattached', 'open', 'prospect'],
    primary: '#064e3b',
    secondary: '#022c22',
    accent: '#34d399',
    text: '#ffffff',
    bgGradient: 'from-[#064e3b] via-[#022c22] to-[#01140e]',
    border: 'border-emerald-500/40',
    type: 'Unattached Prospect'
  },
  {
    id: 'real_madrid',
    name: 'Real Madrid CF',
    short: 'RMA',
    aliases: ['real madrid', 'madrid', 'los blancos', 'real'],
    primary: '#0b1c3d',
    secondary: '#1e3a8a',
    accent: '#f59e0b',
    text: '#ffffff',
    bgGradient: 'from-[#0b1c3d] via-[#102a5c] to-[#050e20]',
    border: 'border-amber-400/50',
    type: 'La Liga • Royal Academy'
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    short: 'FCB',
    aliases: ['barcelona', 'barca', 'fc barcelona', 'la masia'],
    primary: '#7f1d1d',
    secondary: '#1e3a8a',
    accent: '#fbbf24',
    text: '#ffffff',
    bgGradient: 'from-[#7f1d1d] via-[#1e3a8a] to-[#0b1736]',
    border: 'border-amber-400/50',
    type: 'La Liga • La Masia'
  },
  {
    id: 'man_united',
    name: 'Manchester United',
    short: 'MUN',
    aliases: ['manchester united', 'man utd', 'man united', 'united', 'mufc'],
    primary: '#991b1b',
    secondary: '#0f172a',
    accent: '#f59e0b',
    text: '#ffffff',
    bgGradient: 'from-[#991b1b] via-[#450a0a] to-[#0a0a0a]',
    border: 'border-red-500/50',
    type: 'Premier League • Carrington'
  },
  {
    id: 'man_city',
    name: 'Manchester City',
    short: 'MCI',
    aliases: ['manchester city', 'man city', 'city', 'mcfc'],
    primary: '#0284c7',
    secondary: '#0c4a6e',
    accent: '#7dd3fc',
    text: '#ffffff',
    bgGradient: 'from-[#0284c7] via-[#0c4a6e] to-[#041d2c]',
    border: 'border-sky-400/50',
    type: 'Premier League • City Football Academy'
  },
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    short: 'ARS',
    aliases: ['arsenal', 'the gunners', 'afc'],
    primary: '#b91c1c',
    secondary: '#1e3a8a',
    accent: '#fbbf24',
    text: '#ffffff',
    bgGradient: 'from-[#b91c1c] via-[#450a0a] to-[#0e1726]',
    border: 'border-red-400/50',
    type: 'Premier League • Hale End'
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    short: 'LIV',
    aliases: ['liverpool', 'lfc', 'the reds'],
    primary: '#991b1b',
    secondary: '#042f2e',
    accent: '#2dd4bf',
    text: '#ffffff',
    bgGradient: 'from-[#991b1b] via-[#042f2e] to-[#021817]',
    border: 'border-teal-400/50',
    type: 'Premier League • Kirkby'
  },
  {
    id: 'bayern',
    name: 'FC Bayern Munich',
    short: 'BAY',
    aliases: ['bayern', 'bayern munich', 'fc bayern'],
    primary: '#991b1b',
    secondary: '#1e3a8a',
    accent: '#ffffff',
    text: '#ffffff',
    bgGradient: 'from-[#991b1b] via-[#1e3a8a] to-[#061122]',
    border: 'border-red-500/50',
    type: 'Bundesliga • Bayern Campus'
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    short: 'PSG',
    aliases: ['psg', 'paris saint-germain', 'paris sg', 'paris'],
    primary: '#0f172a',
    secondary: '#991b1b',
    accent: '#ef4444',
    text: '#ffffff',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#450a0a]',
    border: 'border-blue-400/40',
    type: 'Ligue 1 • Camp des Loges'
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    short: 'CHE',
    aliases: ['chelsea', 'cfc', 'the blues'],
    primary: '#1e40af',
    secondary: '#0f172a',
    accent: '#fbbf24',
    text: '#ffffff',
    bgGradient: 'from-[#1e40af] via-[#0f172a] to-[#030712]',
    border: 'border-blue-400/50',
    type: 'Premier League • Cobham'
  },
  {
    id: 'dortmund',
    name: 'Borussia Dortmund',
    short: 'BVB',
    aliases: ['dortmund', 'borussia dortmund', 'bvb'],
    primary: '#854d0e',
    secondary: '#0f172a',
    accent: '#facc15',
    text: '#ffffff',
    bgGradient: 'from-[#854d0e] via-[#1f1604] to-[#090601]',
    border: 'border-yellow-400/60',
    type: 'Bundesliga • BVB Evonik'
  },
  {
    id: 'mumbai_city',
    name: 'Mumbai City FC',
    short: 'MCFC',
    aliases: ['mumbai city', 'mumbai city fc', 'mumbai'],
    primary: '#0284c7',
    secondary: '#0f172a',
    accent: '#38bdf8',
    text: '#ffffff',
    bgGradient: 'from-[#0284c7] via-[#075985] to-[#0b1a30]',
    border: 'border-sky-400/50',
    type: 'ISL • Mumbai Academy'
  },
  {
    id: 'mohun_bagan',
    name: 'Mohun Bagan SG',
    short: 'MBSG',
    aliases: ['mohun bagan', 'mohun bagan sg', 'mariners'],
    primary: '#701a75',
    secondary: '#064e3b',
    accent: '#22c55e',
    text: '#ffffff',
    bgGradient: 'from-[#701a75] via-[#064e3b] to-[#022c22]',
    border: 'border-emerald-400/50',
    type: 'ISL • Kolkata Academy'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru FC',
    short: 'BFC',
    aliases: ['bengaluru', 'bengaluru fc', 'the blues bfc'],
    primary: '#1e3a8a',
    secondary: '#991b1b',
    accent: '#ef4444',
    text: '#ffffff',
    bgGradient: 'from-[#1e3a8a] via-[#312e81] to-[#450a0a]',
    border: 'border-blue-400/50',
    type: 'ISL • BFC Academy'
  },
  {
    id: 'kerala_blasters',
    name: 'Kerala Blasters FC',
    short: 'KBFC',
    aliases: ['kerala blasters', 'kbfc', 'kerala', 'blasters'],
    primary: '#a16207',
    secondary: '#1e3a8a',
    accent: '#facc15',
    text: '#ffffff',
    bgGradient: 'from-[#a16207] via-[#1e3a8a] to-[#08152e]',
    border: 'border-yellow-400/50',
    type: 'ISL • KBFC Academy'
  }
];

/**
 * Intelligent Club Matching
 * Detects preset club from name or generates a deterministic sleek club theme
 */
export function getClubTheme(teamName = '') {
  if (!teamName || typeof teamName !== 'string' || !teamName.trim()) {
    return PRESET_CLUBS[0]; // Free Agent
  }

  const clean = teamName.trim().toLowerCase();

  // Try direct or alias match
  const found = PRESET_CLUBS.find(c => {
    if (c.name.toLowerCase() === clean) return true;
    return c.aliases?.some(a => clean.includes(a) || a.includes(clean));
  });

  if (found) return found;

  // Generate deterministic custom club theme
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 142, 262, 340, 35, 190]; // Blue, Green, Purple, Crimson, Amber, Cyan
  const selectedHue = hues[Math.abs(hash) % hues.length];
  const short = clean.slice(0, 3).toUpperCase();

  return {
    id: `custom_${clean.replace(/\s+/g, '_')}`,
    name: teamName.trim(),
    short: short,
    primary: `hsl(${selectedHue}, 70%, 25%)`,
    secondary: `hsl(${selectedHue}, 80%, 15%)`,
    accent: `hsl(${selectedHue}, 85%, 65%)`,
    text: '#ffffff',
    bgGradient: 'from-[#0b221a] via-[#091b29] to-[#030910]',
    border: 'border-emerald-500/40',
    type: 'Registered Football Club'
  };
}

/**
 * Custom Club Badge Storage in localStorage
 */
export function getStoredClubBadge(key) {
  try {
    return localStorage.getItem(`sssp_club_badge_${key}`);
  } catch (e) {
    return null;
  }
}

export function saveStoredClubBadge(key, dataUrl) {
  try {
    if (dataUrl) {
      localStorage.setItem(`sssp_club_badge_${key}`, dataUrl);
    } else {
      localStorage.removeItem(`sssp_club_badge_${key}`);
    }
  } catch (e) {
    console.warn('Failed to save club badge to localStorage:', e);
  }
}

/**
 * Professional Vector Club Crest SVG
 */
export const ClubCrest = ({ club, customBadgeUrl, className = "w-10 h-10", size = 40 }) => {
  if (customBadgeUrl) {
    return (
      <img 
        src={customBadgeUrl} 
        alt={club?.name || 'Club Badge'} 
        className={`${className} object-contain rounded-lg drop-shadow-md`} 
      />
    );
  }

  const theme = typeof club === 'string' ? getClubTheme(club) : (club || PRESET_CLUBS[0]);

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} drop-shadow-lg flex-shrink-0`}
      aria-label={theme.name}
    >
      <defs>
        <linearGradient id={`shieldGrad_${theme.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.primary} />
          <stop offset="100%" stopColor={theme.secondary} />
        </linearGradient>
        <radialGradient id={`crestSheen_${theme.id}`} cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Shield Border */}
      <path
        d="M 50 6 C 74 6, 88 16, 88 38 C 88 66, 68 86, 50 94 C 32 86, 12 66, 12 38 C 12 16, 26 6, 50 6 Z"
        fill={`url(#shieldGrad_${theme.id})`}
        stroke={theme.accent}
        strokeWidth="3.5"
      />

      {/* Inner Inset Shield */}
      <path
        d="M 50 12 C 70 12, 82 20, 82 39 C 82 62, 65 79, 50 86 C 35 79, 18 62, 18 39 C 18 20, 30 12, 50 12 Z"
        fill="none"
        stroke={theme.accent}
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* Upper Banner / Crown bar */}
      <path
        d="M 24 24 L 76 24 L 70 32 L 30 32 Z"
        fill={theme.accent}
        opacity="0.35"
      />

      {/* Top Star */}
      <polygon
        points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20"
        fill={theme.accent}
      />

      {/* Center Monogram / Short Text */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={theme.text}
        fontSize={theme.short.length > 3 ? "18" : "22"}
        fontWeight="900"
        letterSpacing="0.05em"
        style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
      >
        {theme.short}
      </text>

      {/* Lower Center Mini Football Silhouette */}
      <circle cx="50" cy="74" r="5" fill={theme.accent} opacity="0.8" />
      <polygon points="50,71.5 53,73.5 52,76.5 48,76.5 47,73.5" fill={theme.secondary} />

      {/* Gloss Sheen Reflection */}
      <path
        d="M 50 6 C 74 6, 88 16, 88 38 C 88 48, 80 58, 70 65 C 60 50, 40 30, 20 28 C 24 16, 36 6, 50 6 Z"
        fill={`url(#crestSheen_${theme.id})`}
        pointerEvents="none"
      />
    </svg>
  );
};

/**
 * Clean Athletic Player Cutout Silhouette (Vector)
 * Sharp, professional vector silhouette when no real player photo is present.
 */
export const PlayerSilhouette = ({ className = "w-full h-full text-emerald-400" }) => (
  <svg 
    viewBox="0 0 200 240" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="silhouetteGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    {/* Athletic Head & Hair Cutout */}
    <ellipse cx="100" cy="46" rx="22" ry="26" fill="url(#silhouetteGrad)" />
    <path d="M 85 24 Q 100 16 115 24 Q 120 34 118 42 Q 100 38 82 42 Z" opacity="0.4" fill="#ffffff" />
    
    {/* Strong Neck & Athletic Collar */}
    <path d="M 91 68 L 109 68 L 112 80 L 88 80 Z" fill="url(#silhouetteGrad)" />
    
    {/* Shoulders & Athletic Torso with Jersey Lines */}
    <path 
      d="M 52 98 Q 72 80 100 80 Q 128 80 148 98 L 165 142 L 146 150 L 138 126 L 138 238 L 62 238 L 62 126 L 54 150 L 35 142 Z" 
      fill="url(#silhouetteGrad)" 
    />
    
    {/* Jersey Collar V-Neck chalkline */}
    <path d="M 86 82 L 100 102 L 114 82" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
    
    {/* Athletic Chest/Posture Arc */}
    <path d="M 76 130 Q 100 140 124 130" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
  </svg>
);

/**
 * Large Subtle Club Crest Watermark for Profile Banners
 * Renders behind the player cutout at large scale with subtle opacity
 */
export const ClubWatermark = ({ club, customBadgeUrl, className = "w-72 h-72 -left-10 -top-10 opacity-35", style = {} }) => {
  const theme = typeof club === 'string' ? getClubTheme(club) : (club || PRESET_CLUBS[0]);

  return (
    <div 
      className={`absolute pointer-events-none select-none z-0 ${className}`}
      style={style}
      aria-hidden="true"
    >
      {customBadgeUrl ? (
        <img 
          src={customBadgeUrl} 
          alt="" 
          className="w-full h-full object-contain filter contrast-125 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
        />
      ) : (
        <div className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <ClubCrest club={theme} className="w-full h-full" />
        </div>
      )}
    </div>
  );
};

/**
 * Storage helpers for physical attributes: Jersey number, Height, Weight, Country
 */
export function getStoredPlayerPhysicals(key) {
  try {
    const raw = localStorage.getItem(`sssp_player_phys_${key}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveStoredPlayerPhysicals(key, data) {
  try {
    localStorage.setItem(`sssp_player_phys_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save player physical traits:', e);
  }
}

/**
 * Storage helpers for visual scaling: playerSize, crestSize (in percentage, default 100)
 */
export function getStoredVisualSizes(key) {
  try {
    const raw = localStorage.getItem(`sssp_visual_sizes_${key}`);
    return raw ? JSON.parse(raw) : { playerSize: 100, crestSize: 100 };
  } catch (e) {
    return { playerSize: 100, crestSize: 100 };
  }
}

export function saveStoredVisualSizes(key, data) {
  try {
    localStorage.setItem(`sssp_visual_sizes_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save visual sizes:', e);
  }
}

/**
 * Calculate age in years from date of birth (YYYY-MM-DD)
 */
export function calculateAge(dob) {
  if (!dob) return null;
  try {
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  } catch (e) {
    return null;
  }
}

/**
 * Curated Legendary Coaches / Scout Personas
 * References the assets in /public/assets/coaches/
 */
export const PRESET_COACHES = [
  { 
    id: 'pep', 
    name: 'Pep Guardiola', 
    club: 'Manchester City', 
    title: 'Tactical Director & Head Scout',
    photo: '/assets/coaches/pep_guardiola.png', 
    license: 'UEFA Pro License', 
    territory: 'Europe & South America', 
    specialization: 'Positional Play & Overloads',
    experience: '16 Seasons',
    location: 'Manchester, England'
  },
  { 
    id: 'alex', 
    name: 'Sir Alex Ferguson', 
    club: 'Manchester United', 
    title: 'Senior Master Scout & Director',
    photo: '/assets/coaches/sir_alex_ferguson.png', 
    license: 'FA / UEFA Pro Master', 
    territory: 'Global Talent Pipeline', 
    specialization: 'Attacking Mentality & Resilience',
    experience: '27 Seasons',
    location: 'Manchester, England'
  },
  { 
    id: 'mourinho', 
    name: 'José Mourinho', 
    club: 'Real Madrid', 
    title: 'Elite Tactical Scout',
    photo: '/assets/coaches/jose_mourinho.png', 
    license: 'UEFA Pro License', 
    territory: 'Global Senior & Academy', 
    specialization: 'Defensive Compactness & Transition',
    experience: '22 Seasons',
    location: 'Madrid, Spain'
  },
  { 
    id: 'klopp', 
    name: 'Jürgen Klopp', 
    club: 'Liverpool', 
    title: 'Head of Recruitment & Intensity',
    photo: '/assets/coaches/jurgen_klopp.png', 
    license: 'UEFA Pro License', 
    territory: 'Bundesliga & Premier League', 
    specialization: 'Gegenpressing & Workrate',
    experience: '21 Seasons',
    location: 'Liverpool, England'
  },
  { 
    id: 'ancelotti', 
    name: 'Carlo Ancelotti', 
    club: 'Real Madrid', 
    title: 'Technical Director & Recruiter',
    photo: '/assets/coaches/carlo_ancelotti.png', 
    license: 'UEFA Pro License', 
    territory: 'Worldwide Prospects', 
    specialization: 'Tactical Flexibility & Man-Management',
    experience: '28 Seasons',
    location: 'Madrid, Spain'
  }
];

/**
 * Coach / Scout Silhouette (Vector fallback when no photo)
 */
export const CoachSilhouette = ({ className = "w-full h-full text-teal-400" }) => (
  <svg 
    viewBox="0 0 200 240" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="coachSilGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    {/* Coach Head */}
    <ellipse cx="100" cy="44" rx="20" ry="24" fill="url(#coachSilGrad)" />
    {/* Strong Coach Neck */}
    <path d="M 91 66 L 109 66 L 111 78 L 89 78 Z" fill="url(#coachSilGrad)" />
    {/* Tailored Coat / Suit Jacket Silhouette */}
    <path 
      d="M 48 94 Q 72 78 100 78 Q 128 78 152 94 L 168 140 L 152 148 L 142 120 L 142 238 L 58 238 L 58 120 L 48 148 L 32 140 Z" 
      fill="url(#coachSilGrad)" 
    />
    {/* Coat Lapel Lines */}
    <path d="M 82 78 L 100 120 L 118 78" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
    <path d="M 100 120 L 100 238" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 4" />
    {/* Whistle / ID Lanyard ribbon */}
    <path d="M 92 78 L 100 106 L 108 78" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />
    <circle cx="100" cy="110" r="3" fill="#38bdf8" opacity="0.9" />
  </svg>
);

/**
 * Storage helpers for Scout Dossier
 */
export function getStoredScoutDossier(key) {
  try {
    const raw = localStorage.getItem(`sssp_scout_dossier_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveStoredScoutDossier(key, data) {
  try {
    localStorage.setItem(`sssp_scout_dossier_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save scout dossier:', e);
  }
}

