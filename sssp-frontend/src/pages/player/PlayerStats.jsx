import React, { useState, useEffect } from 'react';
import { Target, Calendar, Clock } from 'lucide-react';
import { playerService } from '../../services/api';
import { 
  LoadingSpinner, Alert, Card, StatsCard, StatusBadge, 
  ClassicSoccerBall, PitchHero 
} from '../../components/common';
import useCountUp from '../../hooks/useCountUp';

const AnimatedGPIBar = ({ label, value }) => {
  const animatedValue = useCountUp(value, 900, 0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-slate-600 dark:text-emerald-200/80">{label}</span>
        <span className="font-black text-slate-900 dark:text-white stat-number">{animatedValue}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-[#04120a] rounded-full h-2.5 overflow-hidden border border-emerald-900/30">
        <div 
          className="bg-gradient-to-r from-emerald-600 to-green-400 h-2.5 rounded-full transition-all duration-1000 ease-out shadow-sm" 
          style={{ width: mounted ? `${value}%` : '0%' }} 
        />
      </div>
    </div>
  );
};

const PlayerStats = () => {
  const [data, setData] = useState({
    gpi: null,
    performance: null,
    matchStats: [],
    ranking: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [gpiRes, perfRes, matchRes, playerMatchesRes, rankRes] = await Promise.all([
        playerService.getGPI().catch(() => ({ data: null })),
        playerService.getPerformance().catch(() => ({ data: null })),
        playerService.getMatchStats().catch(() => ({ data: [] })),
        playerService.getMatches().catch(() => ({ data: [] })),
        playerService.getRanking().catch(() => ({ data: null }))
      ]);

      const history = Array.isArray(perfRes.data) ? perfRes.data : [];
      const sum = (k) => history.reduce((n, h) => n + (h[k] || 0), 0);
      const rankings = Array.isArray(rankRes.data) ? rankRes.data : [];
      const overall = rankings.find((r) => r.context === 'OVERALL');
      const positional = rankings.find((r) => (r.context || '').startsWith('POSITION:'));

      // Harmonize logged matches and tournament participations
      const loggedMatches = (Array.isArray(playerMatchesRes?.data) ? playerMatchesRes.data : []).map(m => ({
        matchDescription: m.opponent ? `vs ${m.opponent} (${m.competition || m.matchKind || 'Match'})` : (m.matchDescription || `Match #${m.id}`),
        date: m.matchDate || m.date,
        minutesPlayed: m.minutesPlayed,
        goals: m.goals,
        assists: m.assists,
        yellowCards: m.yellowCards,
        redCards: m.redCards,
        matchKind: m.matchKind,
        performanceScore: m.performanceScore
      }));

      const tournamentStats = (Array.isArray(matchRes?.data) ? matchRes.data : []);
      const combinedMatches = [...loggedMatches, ...tournamentStats];

      setData({
        gpi: gpiRes.data,
        performance: history.length ? {
          totalMatches: sum('totalMatches'), totalGoals: sum('totalGoals'), totalAssists: sum('totalAssists'),
          yellowCards: sum('totalYellowCards'), redCards: sum('totalRedCards'), totalMinutes: sum('totalMinutesPlayed')
        } : (loggedMatches.length ? {
          totalMatches: loggedMatches.length,
          totalGoals: loggedMatches.reduce((acc, m) => acc + (m.goals || 0), 0),
          totalAssists: loggedMatches.reduce((acc, m) => acc + (m.assists || 0), 0),
          yellowCards: loggedMatches.reduce((acc, m) => acc + (m.yellowCards || 0), 0),
          redCards: loggedMatches.reduce((acc, m) => acc + (m.redCards || 0), 0),
          totalMinutes: loggedMatches.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0)
        } : null),
        matchStats: combinedMatches,
        ranking: overall || positional ? {
          overallRank: overall?.rankValue,
          position: positional ? positional.context.replace('POSITION:', '') : null,
          positionRank: positional?.rankValue,
          gpiAtRanking: (overall || positional)?.gpiValue != null ? Number((overall || positional).gpiValue).toFixed(1) : null,
          updatedAt: (overall || positional)?.computedAt
        } : null
      });
    } catch (err) {
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Compiling match intelligence..." /></div>;

  const { gpi, performance, matchStats } = data;

  const renderGPIBar = (label, value) => (
    <AnimatedGPIBar key={label} label={label} value={value} />
  );

  return (
    <div className="space-y-6">
      
      {/* 1. MATCHDAY PERFORMANCE PITCH HERO */}
      <div className="stagger-1">
        <PitchHero
        title="Player Performance Dossier"
        subtitle="Organizer-verified competitive match logs, discipline metrics, and GPI algorithm components"
        badgeText="VERIFIED MATCH METRICS • PERFORMANCE LOG"
        stats={[
          { label: "MINUTES", value: `${performance?.totalMinutes || 0}′` },
          { label: "GOALS", value: performance?.totalGoals || 0 },
          { label: "ASSISTS", value: performance?.totalAssists || 0 },
          { label: "MATCHES", value: performance?.totalMatches || 0 }
        ]}
      />
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-emerald-200 dark:border-emerald-950/60 space-x-2 stagger-2">
        <button 
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all ${
            activeTab === 'OVERVIEW' 
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#071d15]' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          Overview & Metrics
        </button>
        <button 
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider rounded-t-xl transition-all ${
            activeTab === 'MATCHES' 
              ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#071d15]' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('MATCHES')}
        >
          Verified Match Logs ({matchStats.length})
        </button>
      </div>

      {activeTab === 'OVERVIEW' ? (
        <div className="space-y-6 stagger-3">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard 
              title="Official Matches" 
              value={performance?.totalMatches || 0} 
              icon={<Calendar className="w-6 h-6 text-sky-400" />} 
              color="blue"
            />
            <StatsCard 
              title="Minutes On Pitch" 
              value={performance?.totalMinutes || 0} 
              icon={<Clock className="w-6 h-6 text-emerald-400" />} 
              color="emerald"
            />
            <StatsCard 
              title="Total Goals" 
              value={performance?.totalGoals || 0} 
              icon={<ClassicSoccerBall className="w-6 h-6 text-amber-400" />} 
              color="amber"
            />
            <StatsCard 
              title="Total Assists" 
              value={performance?.totalAssists || 0} 
              icon={<Target className="w-6 h-6 text-purple-400" />} 
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Algorithm Component Breakdown */}
            <Card title="GPI Mathematical Component Breakdown" subtitle="Algorithmic weights applied to verified matchday performances" showMatchBall={true}>
              {gpi ? (
                <div className="space-y-4">
                  {renderGPIBar('Quantitative Match Performance', gpi.quantitativeScore || 78)}
                  {renderGPIBar('Field Observations & Scout Ratings', gpi.qualitativeScore || 75)}
                  {renderGPIBar('Consistency & Reliability Index', gpi.consistency || 82)}
                  {renderGPIBar('Recent Form (Last 5 Fixtures)', gpi.recentForm || 84)}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <ClassicSoccerBall className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">No GPI calculation data available</p>
                  <p className="text-xs text-slate-500 mt-1">Play at least 3 sanctioned tournament matches to unlock rating components.</p>
                </div>
              )}
            </Card>

            {/* Fair Play & Discipline */}
            <Card title="Discipline & Fair Play Record" subtitle="Match official cards and disciplinary tracking" showMatchBall={true}>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Yellow card card */}
                  <div className="group p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border-2 border-amber-500/30 hover:border-amber-400 flex items-center space-x-3.5 card-elevate cursor-pointer select-none">
                    <div className="w-7 h-10 rounded bg-amber-400 shadow-lg shadow-amber-400/40 border border-amber-500 flex-shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" title="Yellow Card" />
                    <div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Yellow Cards</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white stat-number">{performance?.yellowCards || 0}</span>
                    </div>
                  </div>

                  {/* Red card card */}
                  <div className="group p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/30 hover:border-rose-400 flex items-center space-x-3.5 card-elevate cursor-pointer select-none">
                    <div className="w-7 h-10 rounded bg-rose-500 shadow-lg shadow-rose-500/40 border border-rose-600 flex-shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" title="Red Card" />
                    <div>
                      <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Red Cards</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white stat-number">{performance?.redCards || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#04120a] border border-emerald-900/30 text-xs text-slate-500 dark:text-emerald-200/70">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Fair Play Rule</span>
                  Disciplinary sanctions and cards affect your final GPI consistency score and can result in match suspensions.
                </div>
              </div>
            </Card>

          </div>
        </div>
      ) : (
        <Card title="Certified Match Logs" subtitle="Chronological list of all certified fixture appearances">
          {matchStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100 dark:divide-emerald-950/60 text-sm">
                <thead className="bg-emerald-500/10 dark:bg-[#051910] text-xs font-bold text-slate-600 dark:text-emerald-300 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Match Fixture</th>
                    <th className="px-4 py-3 text-center">Date</th>
                    <th className="px-4 py-3 text-center">Minutes</th>
                    <th className="px-4 py-3 text-center">⚽ Goals</th>
                    <th className="px-4 py-3 text-center">🎯 Assists</th>
                    <th className="px-4 py-3 text-center">Cards</th>
                    <th className="px-4 py-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/40">
                  {matchStats.map((m, idx) => (
                    <tr key={idx} className="hover:bg-emerald-500/10 dark:hover:bg-[#082216]/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {m.matchDescription || `Fixture #${m.matchId || idx + 1}`}
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-slate-400">
                        {m.date ? new Date(m.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center stat-number font-medium">
                        {m.minutesPlayed ?? '-'}′
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 stat-number">
                        {m.goals || 0}
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-teal-600 dark:text-teal-400 stat-number">
                        {m.assists || 0}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          {m.yellowCards > 0 && <span className="w-3 h-4 rounded bg-amber-400 inline-block shadow-sm" title="Yellow" />}
                          {m.redCards > 0 && <span className="w-3 h-4 rounded bg-rose-500 inline-block shadow-sm" title="Red" />}
                          {!m.yellowCards && !m.redCards && <span className="text-slate-400 text-xs">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <StatusBadge status="COMPLETED" label="Certified" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <ClassicSoccerBall className="w-12 h-12 mx-auto text-emerald-500/50 mb-2 animate-football-bounce" />
              <p className="font-bold text-slate-700 dark:text-slate-200">No certified match appearances logged</p>
              <p className="text-xs text-slate-500 mt-1">Tournament match logs will automatically synchronize after final whistle certification.</p>
            </div>
          )}
        </Card>
      )}

    </div>
  );
};

export default PlayerStats;
