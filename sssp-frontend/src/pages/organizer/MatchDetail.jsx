import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { matchService } from '../../services/api';
import { ArrowLeft, Clock, MapPin, AlertCircle, Edit3, Shield, CheckCircle } from 'lucide-react';
import { Card, StatusBadge, LoadingSpinner, Alert, Button, WhistleIcon, FootballIcon } from '../../components/common';
import { ClassicSoccerBall, PitchMarkings, GrassBladesTrim } from '../../components/common/FootballIcons';

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchMatchData();
  }, [id]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const matchRes = await matchService.getById(id);
      setMatch(matchRes.data);
      
      const [partRes, eventRes, statRes] = await Promise.all([
        matchService.getParticipations(id).catch(() => ({ data: [] })),
        matchService.getEvents(id).catch(() => ({ data: [] })),
        matchService.getMatchStats(id).catch(() => ({ data: [] }))
      ]);
      
      setParticipations(partRes.data || []);
      setEvents((eventRes.data || []).sort((a, b) => b.minute - a.minute));
      setStats(statRes.data || []);
      
    } catch (err) {
      setError("Failed to load match details.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'events', label: 'Match Events' },
    { id: 'participations', label: 'Official Lineups' },
    { id: 'stats', label: 'Player Statistics' },
    ...(match?.confirmed ? [{ id: 'corrections', label: 'Score Corrections' }] : [])
  ];

  const getEventIcon = (type) => {
    switch(type) {
      case 'GOAL': return '⚽';
      case 'ASSIST': return '🅰️';
      case 'YELLOW_CARD': return '🟨';
      case 'RED_CARD': return '🟥';
      case 'SUB_IN': return '↑';
      case 'SUB_OUT': return '↓';
      default: return '⏱️';
    }
  };

  if (loading && !match) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading match dossier..." /></div>;
  if (!match) return <div className="p-6"><Alert type="error" message="Match fixture not found." /></div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => navigate('/matches')} 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Fixtures
        </button>

        <div className="flex items-center space-x-2">
          {!match.confirmed && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/matches/${match.id}/score`)}
              icon={Edit3}
            >
              Enter Match Scores
            </Button>

          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stadium Match Scoreboard Arena */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 pitch-turf-stripes text-white shadow-2xl p-6 sm:p-10">
        {/* Stadium Floodlights Glow */}
        <div className="absolute -top-24 inset-x-0 h-48 pointer-events-none opacity-60 stadium-glow" />
        {/* Goal Net Background Texture */}
        <div className="absolute inset-0 goal-net-texture opacity-30 pointer-events-none" />
        {/* White Chalk Pitch Lines Overlay */}
        <PitchMarkings className="absolute inset-0 opacity-40 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 text-xs">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/50 backdrop-blur-md font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{match.status}</span>
            </div>
            
            <div className="flex items-center gap-4 text-emerald-100/90 font-medium bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-300" /> 
                {new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              {match.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-300" /> {match.venue}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between max-w-2xl mx-auto my-6">
            {/* Home Club */}
            <div className="text-center w-2/5 space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400/50 mx-auto flex items-center justify-center font-black text-2xl text-emerald-300 shadow-xl backdrop-blur-md">
                {match.homeTeam?.name?.charAt(0) || 'H'}
              </div>
              <h2 className="text-base sm:text-xl font-extrabold tracking-tight truncate text-white drop-shadow-md">{match.homeTeam?.name || 'Home Club'}</h2>
            </div>
            
            {/* Score & Center Match Ball */}
            <div className="text-center w-1/5 flex flex-col items-center">
              <div className="group mb-2 cursor-pointer" title="Matchday Match Ball">
                <ClassicSoccerBall className="w-9 h-9 drop-shadow-lg group-hover:rotate-180 transition-transform duration-500" />
              </div>
              
              {(match.status === 'COMPLETED' || match.status === 'LIVE') ? (
                <div className="text-4xl sm:text-6xl font-black tabular-nums tracking-tighter text-amber-300 stat-number drop-shadow-lg">
                  {match.homeScore ?? 0} : {match.awayScore ?? 0}
                </div>
              ) : (
                <div className="text-2xl sm:text-4xl font-extrabold text-white/80 drop-shadow">VS</div>
              )}
              {match.confirmed && (
                <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-900/60 px-3 py-0.5 rounded-full inline-block border border-emerald-400/50">
                  Certified Final
                </span>
              )}
            </div>
            
            {/* Away Club */}
            <div className="text-center w-2/5 space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/90 border-2 border-teal-400/50 mx-auto flex items-center justify-center font-black text-2xl text-teal-300 shadow-xl backdrop-blur-md">
                {match.awayTeam?.name?.charAt(0) || 'A'}
              </div>
              <h2 className="text-base sm:text-xl font-extrabold tracking-tight truncate text-white drop-shadow-md">{match.awayTeam?.name || 'Away Club'}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-5 font-bold text-xs rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' 
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            {events.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No events recorded for this match yet.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((event, idx) => (
                  <div key={idx} className="p-4 flex items-center space-x-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                    <span className="font-mono font-bold text-slate-400 w-10 text-right stat-number">{event.minute}′</span>
                    <span className="text-xl">{getEventIcon(event.type)}</span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 dark:text-white block text-sm">{event.player?.name}</span>
                      <span className="text-slate-400 text-[11px]">{event.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'participations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 p-5 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>{match.homeTeam?.name} Lineup</span>
                <span className="text-xs font-semibold text-slate-400">Home Roster</span>
              </h3>
              <ul className="space-y-2 text-xs">
                {participations.filter(p => p.teamId === match.homeTeam?.id).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.player?.name}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{p.isStarting ? 'Starter' : 'Substitute'}</span>
                  </li>
                ))}
                {participations.filter(p => p.teamId === match.homeTeam?.id).length === 0 && (
                  <li className="text-slate-400 text-center py-4">No team lineup submitted</li>
                )}
              </ul>
            </div>

            <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 p-5 space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>{match.awayTeam?.name} Lineup</span>
                <span className="text-xs font-semibold text-slate-400">Away Roster</span>
              </h3>
              <ul className="space-y-2 text-xs">
                {participations.filter(p => p.teamId === match.awayTeam?.id).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.player?.name}</span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{p.isStarting ? 'Starter' : 'Substitute'}</span>
                  </li>
                ))}
                {participations.filter(p => p.teamId === match.awayTeam?.id).length === 0 && (
                  <li className="text-slate-400 text-center py-4">No team lineup submitted</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <thead className="bg-slate-50 dark:bg-[#071622] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3 text-left">Player Athlete</th>
                    <th className="px-5 py-3 text-center">Goals</th>
                    <th className="px-5 py-3 text-center">Assists</th>
                    <th className="px-5 py-3 text-center">Yellows</th>
                    <th className="px-5 py-3 text-center">Reds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.length === 0 ? (
                    <tr><td colSpan="5" className="px-5 py-8 text-center text-slate-400">No match statistics calibrated yet.</td></tr>
                  ) : (
                    stats.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{stat.player?.name}</td>
                        <td className="px-5 py-3.5 text-center font-extrabold text-emerald-600 dark:text-emerald-400 stat-number">{stat.goals || 0}</td>
                        <td className="px-5 py-3.5 text-center font-extrabold text-teal-600 dark:text-teal-400 stat-number">{stat.assists || 0}</td>
                        <td className="px-5 py-3.5 text-center font-semibold text-amber-500 stat-number">{stat.yellowCards || 0}</td>
                        <td className="px-5 py-3.5 text-center font-semibold text-rose-500 stat-number">{stat.redCards || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'corrections' && match.confirmed && (
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 p-6 space-y-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Official Result Correction Process</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Once certified, match score sheets feed directly into the GPI analytical engine. For official post-match appeals or score corrections, contact SSSP League Administration.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MatchDetail;
