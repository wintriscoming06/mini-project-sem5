import React from 'react';
import Modal from './Modal';
import { Calendar, MapPin } from 'lucide-react';
import { FootballIcon } from './FootballIcons';

export default function MatchDetailModal({ isOpen, onClose, match, playerUsername }) {
  if (!match) return null;

  // Resolve match attributes safely across different endpoint shapes
  const title = match.matchDescription || match.title || (match.opponent ? `vs ${match.opponent}` : `Fixture #${match.matchId || match.id}`);
  const tournament = match.tournamentName || match.competition || 'Sanctioned Tournament';
  const team = match.teamName || '—';
  const position = match.position || '—';
  const minutes = match.minutesPlayed != null ? match.minutesPlayed : (match.minutes != null ? match.minutes : 90);
  const goals = match.goals || 0;
  const assists = match.assists || 0;
  const shots = match.shots || 0;
  const shotsOnTarget = match.shotsOnTarget || 0;
  const passesComp = match.passesCompleted || 0;
  const passesAtt = match.passesAttempted || 0;
  const keyPasses = match.keyPasses || 0;
  const dribblesComp = match.dribblesCompleted || 0;
  const dribblesAtt = match.dribblesAttempted || 0;
  const tackles = match.tackles || 0;
  const interceptions = match.interceptions || 0;
  const clearances = match.clearances || 0;
  const duelsWon = match.duelsWon || 0;
  const yellowCards = match.yellowCards || 0;
  const redCards = match.redCards || 0;

  const dateStr = match.date || match.matchDate;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Official Sanctioned Match';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Match Performance Dossier" size="lg">
      <div className="space-y-4">
        {/* Match Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
            <FootballIcon className="w-24 h-24" />
          </div>

          <div className="relative z-10 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-blue-100">
                {tournament}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                Certified
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
            <div className="flex items-center space-x-3 text-xs text-blue-100/80 pt-0.5">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-blue-200" />
                {formattedDate}
              </span>
              {match.venue && (
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-200" />
                  {match.venue}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Player Match Context Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Player</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate block">
              {match.playerName || match.playerUsername || playerUsername || 'Player'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Team / Club</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate block">
              {team}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Position</span>
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 block">
              {position}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">Minutes</span>
            <span className="text-xs font-black text-slate-900 dark:text-white stat-number block">
              {minutes}′
            </span>
          </div>
        </div>

        {/* Primary Match Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 p-3 rounded-xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
              ⚽ Goals
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white stat-number">
              {goals}
            </span>
          </div>

          <div className="bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/40 p-3 rounded-xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-0.5">
              🎯 Assists
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white stat-number">
              {assists}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Shots (OT)
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white stat-number">
              {shots} <span className="text-xs font-bold text-slate-400">({shotsOnTarget})</span>
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
              Discipline
            </span>
            <div className="flex items-center justify-center space-x-1.5 mt-0.5">
              {yellowCards > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 font-extrabold text-[10px]">
                  {yellowCards} Y
                </span>
              )}
              {redCards > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-extrabold text-[10px]">
                  {redCards} R
                </span>
              )}
              {yellowCards === 0 && redCards === 0 && (
                <span className="text-xs font-bold text-slate-400">Clean</span>
              )}
            </div>
          </div>
        </div>

        {/* Clean Organiser-Verified Performance Metrics Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Organiser-Verified Matchday Statistics
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Passes (Completed / Attempted)</span>
              <span className="text-right font-extrabold text-slate-900 dark:text-white stat-number">
                {passesComp} / {passesAtt}
              </span>
            </div>

            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Key Passes / Chances Created</span>
              <span className="text-right font-extrabold text-blue-600 dark:text-blue-400 stat-number">
                {keyPasses}
              </span>
            </div>

            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Dribbles (Completed / Attempted)</span>
              <span className="text-right font-extrabold text-slate-900 dark:text-white stat-number">
                {dribblesComp} / {dribblesAtt}
              </span>
            </div>

            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Tackles</span>
              <span className="text-right font-extrabold text-slate-900 dark:text-white stat-number">
                {tackles}
              </span>
            </div>

            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Interceptions</span>
              <span className="text-right font-extrabold text-slate-900 dark:text-white stat-number">
                {interceptions}
              </span>
            </div>

            <div className="grid grid-cols-2 px-3.5 py-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
              <span className="text-slate-500 dark:text-slate-400">Clearances & Duels Won</span>
              <span className="text-right font-extrabold text-slate-900 dark:text-white stat-number">
                {clearances} clearances &bull; {duelsWon} duels
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Official competition record</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
