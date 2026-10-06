import React, { useState, useEffect } from 'react';

export const COACHES = [
  {
    id: 'mourinho',
    name: 'José Mourinho',
    title: 'The Special One • Tactical Discipline & Transition',
    era: 'Chelsea • Real Madrid • Inter • Porto',
    pillars: ['TACTICAL ANALYSIS', 'PLAYER EVALUATION', 'SCOUTING'],
    formation: '4-2-3-1',
    formationStyle: 'Low Block & Fast Transition',
    trophies: '26 Major Trophies • 2x UCL',
    winRate: '63.2%',
    accentColor: '#38bdf8',
    themeGradient: 'linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)',
    imageUrl: '/assets/coaches/jose_mourinho.png',
    formationNodes: [
      { x: 50, y: 90, label: 'GK' },
      { x: 18, y: 72, label: 'LB' }, { x: 38, y: 76, label: 'CB' }, { x: 62, y: 76, label: 'CB' }, { x: 82, y: 72, label: 'RB' },
      { x: 35, y: 56, label: 'DM' }, { x: 65, y: 56, label: 'DM' },
      { x: 20, y: 38, label: 'LM' }, { x: 50, y: 35, label: 'AM' }, { x: 80, y: 38, label: 'RM' },
      { x: 50, y: 16, label: 'ST' },
    ],
  },
  {
    id: 'ferguson',
    name: 'Sir Alex Ferguson',
    title: 'Master of Youth Progression & Relentless Winning',
    era: 'Manchester United Dynasty (1986–2013)',
    pillars: ['TALENT DEVELOPMENT', 'PLAYER EVALUATION', 'TEAM BUILDING'],
    formation: '4-4-2',
    formationStyle: 'Classic Dynamic Wing Play',
    trophies: '38 Trophies • 13x Premier League',
    winRate: '65.2%',
    accentColor: '#f59e0b',
    themeGradient: 'linear-gradient(145deg, #450a0a 0%, #1c1917 60%, #78350f 100%)',
    imageUrl: '/assets/coaches/sir_alex_ferguson.png',
    formationNodes: [
      { x: 50, y: 90, label: 'GK' },
      { x: 18, y: 74, label: 'LB' }, { x: 38, y: 76, label: 'CB' }, { x: 62, y: 76, label: 'CB' }, { x: 82, y: 74, label: 'RB' },
      { x: 18, y: 46, label: 'LM' }, { x: 38, y: 50, label: 'CM' }, { x: 62, y: 50, label: 'CM' }, { x: 82, y: 46, label: 'RM' },
      { x: 38, y: 18, label: 'ST' }, { x: 62, y: 18, label: 'ST' },
    ],
  },
  {
    id: 'guardiola',
    name: 'Pep Guardiola',
    title: 'Positional Play & Overload Geometry',
    era: 'Barcelona • Bayern Munich • Man City',
    pillars: ['TACTICAL ANALYSIS', 'POSITIONAL PLAY', 'PLAYER DEVELOPMENT'],
    formation: '3-2-4-1',
    formationStyle: 'Inverted Fullbacks & Box Midfield',
    trophies: '39 Trophies • 3x UCL',
    winRate: '72.4%',
    accentColor: '#38bdf8',
    themeGradient: 'linear-gradient(145deg, #082f49 0%, #0f172a 60%, #0369a1 100%)',
    imageUrl: '/assets/coaches/pep_guardiola.png',
    formationNodes: [
      { x: 50, y: 90, label: 'GK' },
      { x: 24, y: 74, label: 'CB' }, { x: 50, y: 76, label: 'CB' }, { x: 76, y: 74, label: 'CB' },
      { x: 36, y: 58, label: 'DM' }, { x: 64, y: 58, label: 'DM' },
      { x: 16, y: 38, label: 'LW' }, { x: 38, y: 36, label: 'AM' }, { x: 62, y: 36, label: 'AM' }, { x: 84, y: 38, label: 'RW' },
      { x: 50, y: 16, label: 'ST' },
    ],
  },
  {
    id: 'ancelotti',
    name: 'Carlo Ancelotti',
    title: 'Tactical Harmony & Squad Freedom',
    era: 'Real Madrid • AC Milan • Chelsea • PSG',
    pillars: ['TACTICAL FLEXIBILITY', 'PLAYER MANAGEMENT', 'TEAM BUILDING'],
    formation: '4-3-3',
    formationStyle: 'Fluid Asymmetrical Transitions',
    trophies: '29 Trophies • 5x UCL Record',
    winRate: '61.8%',
    accentColor: '#eab308',
    themeGradient: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 60%, #854d0e 100%)',
    imageUrl: '/assets/coaches/carlo_ancelotti.png',
    formationNodes: [
      { x: 50, y: 90, label: 'GK' },
      { x: 18, y: 74, label: 'LB' }, { x: 38, y: 76, label: 'CB' }, { x: 62, y: 76, label: 'CB' }, { x: 82, y: 74, label: 'RB' },
      { x: 50, y: 58, label: 'DM' },
      { x: 32, y: 44, label: 'CM' }, { x: 68, y: 44, label: 'CM' },
      { x: 20, y: 22, label: 'LW' }, { x: 50, y: 18, label: 'CF' }, { x: 80, y: 22, label: 'RW' },
    ],
  },
  {
    id: 'klopp',
    name: 'Jürgen Klopp',
    title: 'High-Intensity Heavy Metal Gegenpressing',
    era: 'Liverpool • Borussia Dortmund • Mainz',
    pillars: ['PRESSING', 'TEAM DEVELOPMENT', 'TACTICAL ANALYSIS'],
    formation: '4-3-3',
    formationStyle: 'Relentless High-Line Pressing',
    trophies: '13 Trophies • UCL & Premier League',
    winRate: '62.5%',
    accentColor: '#10b981',
    themeGradient: 'linear-gradient(145deg, #022c22 0%, #0f172a 60%, #047857 100%)',
    imageUrl: '/assets/coaches/jurgen_klopp.png',
    formationNodes: [
      { x: 50, y: 90, label: 'GK' },
      { x: 18, y: 68, label: 'LB' }, { x: 38, y: 70, label: 'CB' }, { x: 62, y: 70, label: 'CB' }, { x: 82, y: 68, label: 'RB' },
      { x: 50, y: 52, label: 'DM' },
      { x: 30, y: 40, label: 'CM' }, { x: 70, y: 40, label: 'CM' },
      { x: 22, y: 20, label: 'LW' }, { x: 50, y: 16, label: 'CF' }, { x: 78, y: 20, label: 'RW' },
    ],
  },
];

const ACADEMIES = [
  { name: 'La Masia', club: 'FC Barcelona', focus: 'Technical DNA & Positional Intelligence' },
  { name: 'Carrington Academy', club: 'Manchester United', focus: 'Youth Pathway & Tenacity' },
  { name: 'De Toekomst', club: 'AFC Ajax', focus: 'TIPS: Technique, Insight, Personality, Speed' },
  { name: 'Sporting CP Academy', club: 'Sporting CP', focus: 'Elite Ball-Carrying & Development' },
];

export default function ScoutShowcase({ onCoachChange }) {
  const [coachIndex, setCoachIndex] = useState(0);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const coach = COACHES[coachIndex];

  // Preload all coach images on mount
  useEffect(() => {
    COACHES.forEach((c) => {
      const img = new Image();
      img.src = c.imageUrl;
    });
  }, []);

  // Notify parent of active coach
  useEffect(() => {
    if (onCoachChange) {
      onCoachChange(coach.id);
    }
  }, [coach.id, onCoachChange]);

  // Rotate coach every 4s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCoachIndex((prev) => (prev + 1) % COACHES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Scouting simulation animation cycle
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(stepInterval);
  }, []);

  const pipelineSteps = [
    { label: 'SEARCH', text: 'Scanning 12,480+ grassroots players in database...', badge: 'DB ACTIVE' },
    { label: 'FILTER', text: 'Target: Midfielder • Age: 17–21 • Per-90 Metrics', badge: 'TACTICAL CRITERIA' },
    { label: 'ANALYZE', text: 'Evaluating verified match stats & GPI threshold: 80+', badge: 'GPI FILTER' },
    { label: 'DISCOVER', text: 'Verified Match Found: Player shortlisted for scouting', badge: 'CANDIDATE DISCOVERED' },
  ];

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-2 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
          SCOUTING INTELLIGENCE & TACTICAL ANALYSIS
        </span>
      </div>

      {/* Main Scouting Card — Scaled to 450-480px width matching Player Card */}
      <div
        className="w-full max-w-[420px] sm:max-w-[450px] lg:max-w-[465px] xl:max-w-[480px] rounded-[28px] overflow-hidden card-shine transition-all duration-500 relative"
        style={{
          background: coach.themeGradient,
          border: `2.5px solid ${coach.accentColor}`,
          boxShadow: `0 20px 45px -10px ${coach.accentColor}33, inset 0 0 0 1px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Pitch overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 football-pitch-pattern" />

        {/* Top Header: Scouting Mind & Photo */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3.5">
            {/* Real Coach Portrait Photo */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center relative flex-shrink-0"
              style={{
                border: `2.5px solid ${coach.accentColor}`,
                boxShadow: `0 4px 14px rgba(0,0,0,0.5)`,
              }}
            >
              <img
                src={coach.imageUrl}
                alt={coach.name}
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            </div>

            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-cyan-400">
                SCOUTING MIND
              </p>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                {coach.name}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{coach.era}</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className="text-xs font-mono font-black uppercase px-2.5 py-1 rounded-lg border block"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: coach.accentColor,
                borderColor: `${coach.accentColor}66`,
              }}
            >
              {coach.formation}
            </span>
            <p className="text-[10px] text-slate-300 font-medium mt-1">{coach.winRate} Win</p>
          </div>
        </div>

        {/* Tactical Pillars Banner */}
        <div className="relative z-10 px-5 py-2.5 bg-slate-950/50 border-b border-white/10 flex items-center justify-around text-center">
          {coach.pillars.map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-200">
                {pillar}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1" />
            </div>
          ))}
        </div>

        {/* Tactical Formation Pitch Board */}
        <div className="relative z-10 p-4 flex flex-col items-center">
          <div className="w-full h-36 rounded-xl relative overflow-hidden bg-emerald-950/40 border border-emerald-500/25 shadow-inner">
            {/* Pitch Markings */}
            <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
              <div className="w-full h-full border border-emerald-500/20 rounded relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-emerald-500/25" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-emerald-500/25" />
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-7 border-b border-x border-emerald-500/20" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-28 h-7 border-t border-x border-emerald-500/20" />
              </div>
            </div>

            {/* Tactical Nodes for current formation */}
            {coach.formationNodes.map((node, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex flex-col items-center"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-slate-950 shadow-md"
                  style={{
                    backgroundColor: i === 0 ? '#f59e0b' : coach.accentColor,
                    boxShadow: `0 0 10px ${coach.accentColor}`,
                  }}
                >
                  {node.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-300 font-medium mt-1.5 text-center">
            Tactical System: <span className="font-bold text-white">{coach.formationStyle}</span>
          </p>
        </div>

        {/* Live Scouting Pipeline Simulation */}
        <div className="relative z-10 px-5 pb-3">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-cyan-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                SCOUTING RADAR PIPELINE
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {pipelineSteps[pipelineStep].badge}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded transition-all duration-300 ${
                    idx <= pipelineStep ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-slate-200 font-mono tracking-tight leading-snug">
              &gt; {pipelineSteps[pipelineStep].text}
            </p>
          </div>
        </div>

        {/* Academy Benchmarks Ribbon */}
        <div className="relative z-10 px-5 py-2.5 bg-slate-950/80 border-t border-white/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span>🏛</span> TALENT ACADEMY BENCHMARKS
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACADEMIES.map((acad, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5 flex flex-col text-left"
              >
                <span className="text-xs font-black text-white truncate">{acad.name}</span>
                <span className="text-[9px] text-slate-400 truncate">{acad.focus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-[480px] mt-3.5 px-3">
        <button
          onClick={() => setCoachIndex((prev) => (prev - 1 + COACHES.length) % COACHES.length)}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Previous coach"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Indicator dots */}
        <div className="flex items-center gap-2">
          {COACHES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setCoachIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === coachIndex ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-400/40' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={c.name}
            />
          ))}
        </div>

        <button
          onClick={() => setCoachIndex((prev) => (prev + 1) % COACHES.length)}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Next coach"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Mandatory Disclaimer */}
      <p className="text-[11px] text-slate-400 text-center mt-2.5 max-w-[440px]">
        *Famous coaches & academies are visual references for scouting methodology only. Not official SSSP contributors.
      </p>
    </div>
  );
}
