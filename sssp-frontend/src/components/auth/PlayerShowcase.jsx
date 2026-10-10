import React, { useState, useEffect } from 'react';
import SVGRadarChart from './SVGRadarChart';

// 6 exact players: Ronaldo, Messi, Mbappé, Haaland, Yamal, Bruno Fernandes
export const PLAYERS = [
  {
    id: 'ronaldo',
    name: 'Cristiano Ronaldo',
    shortName: 'C. RONALDO',
    position: 'FWD',
    roleTitle: 'Forward • Striker',
    gpi: 94.2,
    overall: 94,
    status: 'ELIGIBLE',
    club: 'Al-Nassr FC',
    nation: 'Portugal',
    flag: '🇵🇹',
    theme: {
      gradient: 'linear-gradient(145deg, #1e293b 0%, #0f172a 55%, #020617 100%)',
      border: '#f59e0b',
      accent: '#fbbf24',
      badgeBg: 'rgba(245, 158, 11, 0.16)',
      glow: 'rgba(245, 158, 11, 0.35)',
      radarColor: '#f59e0b',
    },
    attributes: { PAC: 89, SHO: 95, PAS: 82, DRI: 88, DEF: 35, PHY: 79 },
    stats: { matches: '1,240', goals: '905', assists: '254' },
    imageUrl: '/assets/players/cristiano_ronaldo.png',
  },
  {
    id: 'messi',
    name: 'Lionel Messi',
    shortName: 'L. MESSI',
    position: 'FWD',
    roleTitle: 'Forward • Playmaker',
    gpi: 95.8,
    overall: 95,
    status: 'ELIGIBLE',
    club: 'Inter Miami CF',
    nation: 'Argentina',
    flag: '🇦🇷',
    theme: {
      gradient: 'linear-gradient(145deg, #0c2340 0%, #0f172a 55%, #020617 100%)',
      border: '#38bdf8',
      accent: '#7dd3fc',
      badgeBg: 'rgba(56, 189, 248, 0.16)',
      glow: 'rgba(56, 189, 248, 0.35)',
      radarColor: '#38bdf8',
    },
    attributes: { PAC: 85, SHO: 93, PAS: 95, DRI: 96, DEF: 34, PHY: 66 },
    stats: { matches: '1,085', goals: '852', assists: '382' },
    imageUrl: '/assets/players/lionel_messi.png',
  },
  {
    id: 'mbappe',
    name: 'Kylian Mbappé',
    shortName: 'K. MBAPPÉ',
    position: 'FWD',
    roleTitle: 'Forward • Winger',
    gpi: 92.4,
    overall: 92,
    status: 'ELIGIBLE',
    club: 'Real Madrid CF',
    nation: 'France',
    flag: '🇫🇷',
    theme: {
      gradient: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 55%, #030712 100%)',
      border: '#a855f7',
      accent: '#c084fc',
      badgeBg: 'rgba(168, 85, 247, 0.16)',
      glow: 'rgba(168, 85, 247, 0.35)',
      radarColor: '#c084fc',
    },
    attributes: { PAC: 97, SHO: 91, PAS: 80, DRI: 92, DEF: 36, PHY: 78 },
    stats: { matches: '452', goals: '334', assists: '162' },
    imageUrl: '/assets/players/kylian_mbappe.png',
  },
  {
    id: 'haaland',
    name: 'Erling Haaland',
    shortName: 'E. HAALAND',
    position: 'ST',
    roleTitle: 'Striker • Goal Machine',
    gpi: 93.7,
    overall: 93,
    status: 'ELIGIBLE',
    club: 'Manchester City',
    nation: 'Norway',
    flag: '🇳🇴',
    theme: {
      gradient: 'linear-gradient(145deg, #083344 0%, #0f172a 55%, #020617 100%)',
      border: '#06b6d4',
      accent: '#67e8f9',
      badgeBg: 'rgba(6, 182, 212, 0.16)',
      glow: 'rgba(6, 182, 212, 0.35)',
      radarColor: '#06b6d4',
    },
    attributes: { PAC: 90, SHO: 96, PAS: 72, DRI: 81, DEF: 45, PHY: 90 },
    stats: { matches: '380', goals: '310', assists: '56' },
    imageUrl: '/assets/players/erling_haaland.png',
  },
  {
    id: 'yamal',
    name: 'Lamine Yamal',
    shortName: 'L. YAMAL',
    position: 'WGR',
    roleTitle: 'Right Winger • Wonderkid',
    gpi: 88.5,
    overall: 88,
    status: 'PROSPECT',
    club: 'FC Barcelona',
    nation: 'Spain',
    flag: '🇪🇸',
    theme: {
      gradient: 'linear-gradient(145deg, #431407 0%, #0f172a 60%, #020617 100%)',
      border: '#f97316',
      accent: '#fb923c',
      badgeBg: 'rgba(249, 115, 22, 0.16)',
      glow: 'rgba(249, 115, 22, 0.35)',
      radarColor: '#fb923c',
    },
    attributes: { PAC: 91, SHO: 82, PAS: 87, DRI: 93, DEF: 42, PHY: 68 },
    stats: { matches: '92', goals: '22', assists: '36' },
    imageUrl: '/assets/players/lamine_yamal.png',
  },
  {
    id: 'bruno',
    name: 'Bruno Fernandes',
    shortName: 'B. FERNANDES',
    position: 'CAM',
    roleTitle: 'Attacking Midfielder • Playmaker',
    gpi: 89.3,
    overall: 89,
    status: 'ELIGIBLE',
    club: 'Manchester United',
    nation: 'Portugal',
    flag: '🇵🇹',
    theme: {
      gradient: 'linear-gradient(145deg, #450a0a 0%, #0f172a 55%, #020617 100%)',
      border: '#ef4444',
      accent: '#f87171',
      badgeBg: 'rgba(239, 68, 68, 0.16)',
      glow: 'rgba(239, 68, 68, 0.35)',
      radarColor: '#f87171',
    },
    attributes: { PAC: 76, SHO: 86, PAS: 91, DRI: 84, DEF: 70, PHY: 78 },
    stats: { matches: '610', goals: '184', assists: '168' },
    imageUrl: '/assets/players/bruno_fernandes.png',
  },
];

export default function PlayerShowcase({ onPlayerChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const player = PLAYERS[currentIndex];

  // Preload all 6 real player images on initial mount for instant switching
  useEffect(() => {
    PLAYERS.forEach((p) => {
      const img = new Image();
      img.src = p.imageUrl;
    });
  }, []);

  // Notify parent of active player so the left-side background crossfades
  useEffect(() => {
    if (onPlayerChange) {
      onPlayerChange(player.id);
    }
  }, [player.id, onPlayerChange]);

  // Rotate every 3.8 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PLAYERS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % PLAYERS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + PLAYERS.length) % PLAYERS.length);

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-2 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
          PLAYER SCOUTING CARD • VERIFIED GPI
        </span>
      </div>

      {/* Main Card Shield Container — Scaled ~28-32% larger while keeping exact GPI visual language */}
      <div
        className="w-full max-w-[420px] sm:max-w-[450px] lg:max-w-[465px] xl:max-w-[480px] rounded-[28px] overflow-hidden card-shine transition-all duration-500 relative"
        style={{
          background: player.theme.gradient,
          border: `2.5px solid ${player.theme.border}`,
          boxShadow: `0 20px 45px -10px ${player.theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Subtle pitch pattern overlay from gpi-app */}
        <div className="absolute inset-0 pointer-events-none opacity-25 football-pitch-pattern" />

        {/* Diagonal metallic light sheen */}
        <div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.7) 0%, transparent 60%)',
          }}
        />

        {/* Card Header Row */}
        <div className="relative z-10 px-6 pt-5 pb-1 flex items-start justify-between">
          {/* Left: Overall Rating + Position */}
          <div className="flex flex-col items-start leading-none">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tighter"
              style={{ color: '#ffffff', textShadow: '0 3px 12px rgba(0,0,0,0.6)' }}
            >
              {player.overall}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span
                className="text-xs font-black uppercase px-2.5 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: player.theme.badgeBg,
                  color: player.theme.accent,
                  border: `1.5px solid ${player.theme.border}55`,
                }}
              >
                {player.position}
              </span>
              <span className="text-sm">{player.flag}</span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-0.5 mt-2 opacity-85 text-amber-400 text-xs">
              ★ ★ ★
            </div>
          </div>

          {/* Right: GPI Metric Pill */}
          <div className="flex flex-col items-end leading-none">
            <div
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-inner"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: `1.5px solid ${player.theme.border}77`,
              }}
            >
              <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: player.theme.accent }}>
                GPI
              </span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                {player.gpi}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5 text-slate-300">
              {player.status}
            </span>
          </div>
        </div>

        {/* Player Avatar — Enlarged to 112-128px for prominent real player portrait */}
        <div className="relative z-10 flex flex-col items-center mt-0.5">
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center relative transition-transform duration-500"
            style={{
              border: `3px solid ${player.theme.border}`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(15,23,42,0.85) 100%)',
              boxShadow: `0 10px 26px rgba(0,0,0,0.45), inset 0 0 14px rgba(255,255,255,0.25)`,
            }}
          >
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
          </div>

          {/* Name & Club */}
          <div className="text-center mt-2.5 px-4">
            <h3
              className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white truncate"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
            >
              {player.name}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 opacity-95 flex items-center justify-center gap-2 mt-0.5">
              <span>{player.club}</span>
              <span>•</span>
              <span style={{ color: player.theme.accent }}>{player.roleTitle}</span>
            </p>
          </div>
        </div>

        {/* Ornamental Divider with football icon */}
        <div className="relative z-10 flex items-center justify-center gap-2.5 my-3 px-8 opacity-70">
          <div className="flex-1 h-px bg-white/20" />
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="12 8 8.5 10.5 9.8 14.5 14.2 14.5 15.5 10.5" fill="currentColor" fillOpacity="0.3" />
          </svg>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Center Section: Attribute Grid & SVGRadarChart */}
        <div className="relative z-10 px-6 pb-2 flex items-center justify-between gap-3">
          {/* 6 FUT Attributes */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-left flex-1">
            {Object.entries(player.attributes).map(([attr, val]) => (
              <div key={attr} className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {attr}
                </span>
                <span
                  className="text-base sm:text-lg font-black font-mono ml-2"
                  style={{ color: player.theme.accent }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Scaled Radar Chart (145px) */}
          <div className="flex-shrink-0">
            <SVGRadarChart
              attributes={player.attributes}
              size={145}
              themeColor={player.theme.radarColor}
            />
          </div>
        </div>

        {/* Scouting Combine Rating Ribbon */}
        <div className="relative z-10 mx-5 mb-1 py-1.5 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2 text-emerald-300 font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Scouting Combine Index</span>
          </div>
          <span className="text-amber-400 font-mono font-bold">
            PAC {player.attributes.PAC} • DRI {player.attributes.DRI}
          </span>
        </div>


        {/* Bottom Match Statistics Bar */}
        <div className="relative z-10 mt-2 pt-2.5 pb-3 px-6 border-t border-white/10 bg-slate-950/60">
          <div className="grid grid-cols-3 text-center divide-x divide-white/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Matches</p>
              <p className="text-base sm:text-lg font-black text-white font-mono mt-0.5">{player.stats.matches}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Goals</p>
              <p className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">{player.stats.goals}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assists</p>
              <p className="text-base sm:text-lg font-black text-cyan-400 font-mono mt-0.5">{player.stats.assists}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Carousel Controls */}
      <div className="flex items-center justify-between w-full max-w-[480px] mt-3.5 px-3">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Previous player"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Carousel indicator dots with player label */}
        <div className="flex items-center gap-2">
          {PLAYERS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-emerald-400 shadow-md shadow-emerald-400/40' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={p.name}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Next player"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Demonstration notice */}
      <p className="text-[11px] text-slate-400 text-center mt-2.5 max-w-[440px]">
        *Visual demonstration of the Grassroots Player Index (GPI) analytics engine. Real player assets used for showcase purposes.
      </p>
    </div>
  );
}
