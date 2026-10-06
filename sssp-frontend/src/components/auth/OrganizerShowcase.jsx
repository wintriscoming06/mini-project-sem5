import React, { useState, useEffect } from 'react';

export const TOURNAMENTS = [
  {
    id: 'world_cup',
    name: 'FIFA World Cup',
    country: 'Global Showcase',
    flag: '🌍',
    teams: '48 NATIONS',
    matches: '104 FIXTURES',
    format: 'Group Stage & Knockout Finals',
    accentColor: '#f59e0b',
    themeGradient: 'linear-gradient(145deg, #3d2204 0%, #0f172a 60%, #78350f 100%)',
    imageUrl: '/assets/tournaments/fifa_world_cup.png',
    table: [
      { rank: 1, team: 'Argentina', pld: 7, gd: '+9', pts: 18, form: ['W', 'W', 'W', 'W'] },
      { rank: 2, team: 'France', pld: 7, gd: '+11', pts: 16, form: ['W', 'W', 'W', 'D'] },
      { rank: 3, team: 'Croatia', pld: 7, gd: '+4', pts: 14, form: ['W', 'D', 'W', 'W'] },
      { rank: 4, team: 'Morocco', pld: 7, gd: '+3', pts: 13, form: ['W', 'W', 'L', 'L'] },
    ],
    fixture: { home: 'Argentina', away: 'France', score: '3 (4) - 3 (2)', status: 'WORLD CHAMPIONS' },
  },
  {
    id: 'premier_league',
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    teams: '20 CLUBS',
    matches: '380 MATCHES',
    format: 'Double Round-Robin',
    accentColor: '#00ff85',
    themeGradient: 'linear-gradient(145deg, #2b0036 0%, #0f172a 60%, #064e3b 100%)',
    imageUrl: '/assets/tournaments/premier_league.png',
    table: [
      { rank: 1, team: 'Arsenal', pld: 28, gd: '+45', pts: 64, form: ['W', 'W', 'W', 'W'] },
      { rank: 2, team: 'Liverpool', pld: 28, gd: '+39', pts: 64, form: ['W', 'D', 'W', 'W'] },
      { rank: 3, team: 'Man City', pld: 28, gd: '+35', pts: 63, form: ['W', 'W', 'D', 'W'] },
      { rank: 4, team: 'Aston Villa', pld: 28, gd: '+17', pts: 55, form: ['L', 'W', 'W', 'D'] },
    ],
    fixture: { home: 'Arsenal', away: 'Chelsea', score: '3 - 1', status: 'FULL TIME' },
  },
  {
    id: 'champions_league',
    name: 'UEFA Champions League',
    country: 'Europe',
    flag: '⭐',
    teams: '36 CLUBS',
    matches: '189 MATCHES',
    format: 'Swiss League Phase & Knockouts',
    accentColor: '#38bdf8',
    themeGradient: 'linear-gradient(145deg, #021a40 0%, #0f172a 60%, #075985 100%)',
    imageUrl: '/assets/tournaments/champions_league.png',
    table: [
      { rank: 1, team: 'Real Madrid', pld: 8, gd: '+16', pts: 21, form: ['W', 'W', 'W', 'W'] },
      { rank: 2, team: 'Bayern Munich', pld: 8, gd: '+14', pts: 19, form: ['W', 'W', 'D', 'W'] },
      { rank: 3, team: 'Man City', pld: 8, gd: '+12', pts: 18, form: ['W', 'D', 'W', 'W'] },
      { rank: 4, team: 'Inter Milan', pld: 8, gd: '+9', pts: 17, form: ['D', 'W', 'W', 'W'] },
    ],
    fixture: { home: 'Real Madrid', away: 'Bayern', score: '2 - 1', status: 'FINAL' },
  },
];

export default function OrganizerShowcase({ onTournamentChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const tournament = TOURNAMENTS[currentIndex];

  // Preload tournament images
  useEffect(() => {
    TOURNAMENTS.forEach((t) => {
      const img = new Image();
      img.src = t.imageUrl;
    });
  }, []);

  // Notify parent of active tournament
  useEffect(() => {
    if (onTournamentChange) {
      onTournamentChange(tournament.id);
    }
  }, [tournament.id, onTournamentChange]);

  // Rotate competition every 4s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TOURNAMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Tournament operations workflow animation
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setWorkflowStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(stepInterval);
  }, []);

  const workflowSteps = [
    { label: 'FIXTURE CREATED', desc: 'Schedule generated with automated pitch assignment', badge: 'SCHEDULING' },
    { label: 'MATCH IN PROGRESS', desc: 'Real-time score & event logging verified by match official', badge: 'LIVE SCORING' },
    { label: 'STANDINGS UPDATED', desc: 'Instant points, goal difference & tiebreaker recalculated', badge: 'LEAGUE TABLE' },
    { label: 'NEXT COMPETITION', desc: 'Tournament stage progress saved & published to scouts', badge: 'STAGE COMPLETE' },
  ];

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-2 relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-2" />
          TOURNAMENT & LEAGUE OPERATIONS
        </span>
      </div>

      {/* Main Tournament Card — Scaled to 450-480px matching Player Card */}
      <div
        className="w-full max-w-[420px] sm:max-w-[450px] lg:max-w-[465px] xl:max-w-[480px] rounded-[28px] overflow-hidden card-shine transition-all duration-500 relative"
        style={{
          background: tournament.themeGradient,
          border: `2.5px solid ${tournament.accentColor}`,
          boxShadow: `0 20px 45px -10px ${tournament.accentColor}33, inset 0 0 0 1px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Pitch overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 football-pitch-pattern" />

        {/* Tournament Header with Trophy Asset */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3.5">
            {/* Real Tournament Trophy Asset */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center relative flex-shrink-0 bg-slate-900/80 p-1"
              style={{
                border: `2.5px solid ${tournament.accentColor}`,
                boxShadow: `0 4px 14px rgba(0,0,0,0.5)`,
              }}
            >
              <img
                src={tournament.imageUrl}
                alt={tournament.name}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                TOURNAMENT MANAGEMENT
              </p>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white mt-0.5 flex items-center gap-2">
                <span>{tournament.name}</span>
                <span className="text-sm">{tournament.flag}</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">{tournament.country} • {tournament.format}</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className="text-xs font-black font-mono uppercase px-2.5 py-1 rounded-lg border block"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: tournament.accentColor,
                borderColor: `${tournament.accentColor}66`,
              }}
            >
              {tournament.teams}
            </span>
            <p className="text-[10px] text-slate-300 font-mono mt-1">{tournament.matches}</p>
          </div>
        </div>

        {/* Live Fixture Preview Card */}
        <div className="relative z-10 px-5 pt-3.5 pb-2">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-white/10 flex items-center justify-between shadow-inner">
            <div className="flex-1 text-left">
              <span className="text-xs font-black text-white block truncate">{tournament.fixture.home}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Home Club</span>
            </div>

            <div className="px-3.5 py-1.5 bg-white/5 rounded-lg border border-white/10 text-center">
              <span
                className="text-base font-black font-mono tracking-wider block"
                style={{ color: tournament.accentColor }}
              >
                {tournament.fixture.score}
              </span>
              <span className="text-[9px] font-bold uppercase text-emerald-400 tracking-wider">
                {tournament.fixture.status}
              </span>
            </div>

            <div className="flex-1 text-right">
              <span className="text-xs font-black text-white block truncate">{tournament.fixture.away}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Away Club</span>
            </div>
          </div>
        </div>

        {/* Mini Standings Table */}
        <div className="relative z-10 px-5 pb-2.5">
          <div className="bg-slate-950/50 rounded-xl p-2.5 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 px-1 border-b border-white/10">
              <span>Pos / Club</span>
              <div className="flex items-center gap-4">
                <span>Pld</span>
                <span>GD</span>
                <span className="text-white">Pts</span>
              </div>
            </div>

            <div className="divide-y divide-white/5 mt-1">
              {tournament.table.map((row) => (
                <div key={row.rank} className="flex items-center justify-between py-1.5 px-1 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center font-mono ${
                        row.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {row.rank}
                    </span>
                    <span className="font-bold text-white truncate max-w-[130px]">{row.team}</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-[11px]">
                    <span className="text-slate-400">{row.pld}</span>
                    <span className="text-slate-300">{row.gd}</span>
                    <span
                      className="font-black text-white"
                      style={{ color: row.rank === 1 ? tournament.accentColor : '#ffffff' }}
                    >
                      {row.pts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Operations Lifecycle Animation Banner */}
        <div className="relative z-10 px-5 pb-4">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black text-amber-400 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                TOURNAMENT OPERATIONS PIPELINE
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {workflowSteps[workflowStep].badge}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {workflowSteps.map((s, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded transition-all duration-300 ${
                    idx <= workflowStep ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-white font-mono font-semibold">
              &gt; {workflowSteps[workflowStep].label}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {workflowSteps[workflowStep].desc}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-[480px] mt-3.5 px-3">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + TOURNAMENTS.length) % TOURNAMENTS.length)}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Previous tournament"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Indicator dots */}
        <div className="flex items-center gap-2">
          {TOURNAMENTS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/40' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
              }`}
              title={t.name}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % TOURNAMENTS.length)}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Next tournament"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-400 text-center mt-2.5 max-w-[440px]">
        *Demo visual data illustrating the SSSP tournament & league fixtures engine.
      </p>
    </div>
  );
}
