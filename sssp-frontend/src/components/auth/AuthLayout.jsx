import React, { useState } from 'react';
import PlayerShowcase from './PlayerShowcase';
import ScoutShowcase from './ScoutShowcase';
import OrganizerShowcase from './OrganizerShowcase';

const ROLES = [
  { id: 'PLAYER', label: 'Player', icon: '⚽' },
  { id: 'SCOUT', label: 'Scout', icon: '🔎' },
  { id: 'ORGANIZER', label: 'Organizer', icon: '🏟' },
];

export default function AuthLayout({
  activeRole = 'PLAYER',
  onRoleChange,
  children,
}) {
  const [activePlayerId, setActivePlayerId] = useState('ronaldo');
  const [activeCoachId, setActiveCoachId] = useState('mourinho');
  const [activeTournamentId, setActiveTournamentId] = useState('world_cup');

  return (
    <div className="min-h-screen w-full bg-[#070e1b] text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* ======================================================== */}
      {/* LEFT SIDE: FOOTBALL & SCOUTING EXPERIENCE (55-60%) */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[58%] xl:w-[60%] relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-[#070e1b] via-[#0b172a] to-[#040914] overflow-hidden transition-colors duration-1000">
        
        {/* ======================================================== */}
        {/* DYNAMIC PLAYER ATMOSPHERIC BACKGROUNDS */}
        {/* ======================================================== */}
        {activeRole === 'PLAYER' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* 1. CRISTIANO RONALDO: Portugal / United / Real Madrid */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'ronaldo' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 20%, rgba(185, 28, 28, 0.22) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.18) 0%, transparent 55%), radial-gradient(circle at 10% 85%, rgba(5, 150, 105, 0.12) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 1px, transparent 1px), linear-gradient(45deg, rgba(220, 38, 38, 0.15) 1px, transparent 1px)',
                  backgroundSize: '72px 72px',
                }}
              />
            </div>

            {/* 2. LIONEL MESSI: Argentina Albiceleste / Barcelona Gold */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'messi' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 40% 15%, rgba(56, 189, 248, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(234, 179, 8, 0.20) 0%, transparent 50%), radial-gradient(circle at 15% 75%, rgba(67, 56, 202, 0.15) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(120deg, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(60deg, rgba(250, 204, 21, 0.15) 1px, transparent 1px)',
                  backgroundSize: '80px 80px',
                }}
              />
            </div>

            {/* 3. KYLIAN MBAPPÉ: France Tricolore / Speed & Velocity */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'mbappe' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 20%, rgba(37, 99, 235, 0.28) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(220, 38, 38, 0.18) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(147, 51, 234, 0.15) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(150deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(30deg, rgba(239, 68, 68, 0.2) 1px, transparent 1px)',
                  backgroundSize: '64px 64px',
                }}
              />
            </div>

            {/* 4. ERLING HAALAND: Norway Aurora / Manchester City Sky Blue */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'haaland' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 15%, rgba(14, 165, 233, 0.30) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.20) 0%, transparent 50%), radial-gradient(circle at 85% 75%, rgba(245, 158, 11, 0.14) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(6, 182, 212, 0.25) 1px, transparent 1px), linear-gradient(0deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)',
                  backgroundSize: '76px 76px',
                }}
              />
            </div>

            {/* 5. LAMINE YAMAL: Spain Gold / Barcelona Garnet Prodigy */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'yamal' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 45% 20%, rgba(234, 88, 12, 0.26) 0%, transparent 60%), radial-gradient(circle at 75% 80%, rgba(79, 70, 229, 0.22) 0%, transparent 50%), radial-gradient(circle at 15% 75%, rgba(234, 179, 8, 0.16) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 1px, transparent 1px), linear-gradient(45deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)',
                  backgroundSize: '68px 68px',
                }}
              />
            </div>

            {/* 6. BRUNO FERNANDES: Portugal / Manchester United Old Trafford */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activePlayerId === 'bruno' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 18%, rgba(220, 38, 38, 0.26) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(185, 28, 28, 0.20) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.14) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(125deg, rgba(239, 68, 68, 0.25) 1px, transparent 1px), linear-gradient(35deg, rgba(245, 158, 11, 0.18) 1px, transparent 1px)',
                  backgroundSize: '70px 70px',
                }}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DYNAMIC COACH ATMOSPHERIC BACKGROUNDS */}
        {/* ======================================================== */}
        {activeRole === 'SCOUT' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* 1. MOURINHO: Chelsea / Inter / Real Madrid Tactical Steel */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeCoachId === 'mourinho' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 20%, rgba(2, 132, 199, 0.26) 0%, transparent 60%), radial-gradient(circle at 80% 75%, rgba(15, 23, 42, 0.4) 0%, transparent 50%), radial-gradient(circle at 20% 85%, rgba(56, 189, 248, 0.14) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(0deg, rgba(2, 132, 199, 0.2) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />
            </div>

            {/* 2. SIR ALEX FERGUSON: Manchester United Dynasty Crimson & Gold */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeCoachId === 'ferguson' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 40% 18%, rgba(220, 38, 38, 0.26) 0%, transparent 60%), radial-gradient(circle at 75% 80%, rgba(245, 158, 11, 0.22) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(153, 27, 27, 0.16) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 1px, transparent 1px), linear-gradient(45deg, rgba(245, 158, 11, 0.2) 1px, transparent 1px)',
                  backgroundSize: '68px 68px',
                }}
              />
            </div>

            {/* 3. GUARDIOLA: Barcelona / Bayern / Man City Positional Play */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeCoachId === 'guardiola' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 45% 15%, rgba(14, 165, 233, 0.28) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.20) 0%, transparent 50%), radial-gradient(circle at 15% 70%, rgba(67, 56, 202, 0.16) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(60deg, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(120deg, rgba(37, 99, 235, 0.2) 1px, transparent 1px)',
                  backgroundSize: '74px 74px',
                }}
              />
            </div>

            {/* 4. ANCELOTTI: Real Madrid / AC Milan Regal Gold & White */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeCoachId === 'ancelotti' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 20%, rgba(234, 179, 8, 0.24) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(185, 28, 28, 0.18) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(248, 250, 252, 0.10) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(234, 179, 8, 0.25) 1px, transparent 1px), linear-gradient(45deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                  backgroundSize: '72px 72px',
                }}
              />
            </div>

            {/* 5. JÜRGEN KLOPP: Liverpool / Dortmund Gegenpress Energy */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeCoachId === 'klopp' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 40% 18%, rgba(220, 38, 38, 0.26) 0%, transparent 60%), radial-gradient(circle at 75% 80%, rgba(234, 179, 8, 0.20) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(5, 150, 105, 0.16) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(150deg, rgba(239, 68, 68, 0.25) 1px, transparent 1px), linear-gradient(30deg, rgba(234, 179, 8, 0.2) 1px, transparent 1px)',
                  backgroundSize: '65px 65px',
                }}
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DYNAMIC ORGANIZER ATMOSPHERIC BACKGROUNDS */}
        {/* ======================================================== */}
        {activeRole === 'ORGANIZER' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* 1. FIFA WORLD CUP: Global Golden Prestige */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeTournamentId === 'world_cup' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 40% 20%, rgba(245, 158, 11, 0.28) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.20) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(16, 185, 129, 0.14) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
            </div>

            {/* 2. PREMIER LEAGUE: Purple & Emerald Barclays Energy */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeTournamentId === 'premier_league' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 35% 20%, rgba(168, 85, 247, 0.26) 0%, transparent 60%), radial-gradient(circle at 75% 75%, rgba(0, 255, 133, 0.18) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(15, 23, 42, 0.4) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 1px, transparent 1px), linear-gradient(45deg, rgba(0, 255, 133, 0.2) 1px, transparent 1px)',
                  backgroundSize: '64px 64px',
                }}
              />
            </div>

            {/* 3. UEFA CHAMPIONS LEAGUE: Midnight Navy & Starball Radiance */}
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                activeTournamentId === 'champions_league' ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 45% 15%, rgba(56, 189, 248, 0.30) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(2, 132, 199, 0.22) 0%, transparent 50%), radial-gradient(circle at 15% 75%, rgba(30, 58, 138, 0.20) 0%, transparent 45%)',
                }}
              />
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(60deg, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(120deg, rgba(14, 165, 233, 0.2) 1px, transparent 1px)',
                  backgroundSize: '76px 76px',
                }}
              />
            </div>
          </div>
        )}

        {/* Base Pitch Patterns & Stadium Glow */}
        <div className="football-pitch-pattern absolute inset-0 pointer-events-none opacity-40" />
        <div className="pitch-lines-overlay absolute inset-0 pointer-events-none opacity-60" />
        <div className="stadium-glow absolute inset-0 pointer-events-none" />

        {/* Ambient tactical dots on pitch */}
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-emerald-400/30 animate-tactical-pulse pointer-events-none" />
        <div className="absolute top-2/3 left-1/3 w-2 h-2 rounded-full bg-cyan-400/30 animate-tactical-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-amber-400/30 animate-tactical-pulse pointer-events-none" />

        {/* Top Header & Role Switcher */}
        <div className="relative z-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
          {/* SSSP Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-base">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
                  SSSP
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                  PLATFORM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Sports Stats & Scouting Platform
              </p>
            </div>
          </div>

          {/* Dynamic Role Switcher Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md self-start sm:self-auto shadow-md">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2.5 hidden md:inline-block">
              EXPERIENCE:
            </span>
            {ROLES.map((r) => {
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onRoleChange && onRoleChange(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Dynamic Role-Based Showcase */}
        <div className="relative z-20 flex-1 flex items-center justify-center py-2 sm:py-3 transition-all duration-500">
          {activeRole === 'PLAYER' && <PlayerShowcase onPlayerChange={setActivePlayerId} />}
          {activeRole === 'SCOUT' && <ScoutShowcase onCoachChange={setActiveCoachId} />}
          {activeRole === 'ORGANIZER' && <OrganizerShowcase onTournamentChange={setActiveTournamentId} />}
        </div>

        {/* Bottom Banner & Rolling Football Animation */}
        <div className="relative z-20 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-slate-300">
              Grassroots Football Intelligence Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
            <span>Verified Match Stats</span>
            <span>•</span>
            <span>Objective 0–100 GPI</span>
            <span>•</span>
            <span>Scouting Analytics</span>
          </div>
        </div>

        {/* Rolling Football Animation Trajectory across bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden pointer-events-none opacity-40">
          <div className="w-4 h-4 text-emerald-400 animate-football-roll text-xs">
            ⚽
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT SIDE: AUTHENTICATION FORM (40-45%) - UNCHANGED THEME */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[42%] xl:w-[40%] flex items-center justify-center p-4 sm:p-8 lg:p-10 bg-[#091222] relative">
        {/* Fixed subtle ambient background glow for stable login panel */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Clean, spacious form wrapper (400-480px width) */}
        <div className="w-full max-w-[440px] sm:max-w-[460px] relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
