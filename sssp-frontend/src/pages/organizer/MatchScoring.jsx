import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchService } from '../../services/api';
import { ArrowLeft, Play, Square, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Modal, Button, LoadingSpinner, Alert, StatusBadge, WhistleIcon, FootballIcon } from '../../components/common';

const MatchScoring = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [eventModal, setEventModal] = useState({ show: false, type: '', team: null });
  const [confirmModal, setConfirmModal] = useState(false);
  
  const [eventData, setEventData] = useState({ playerId: '', minute: '' });
  const [finalScore, setFinalScore] = useState({ home: 0, away: 0 });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const matchRes = await matchService.getById(id);
      setMatch(matchRes.data);
      setFinalScore({ home: matchRes.data.homeScore || 0, away: matchRes.data.awayScore || 0 });
      
      const [eventsRes, partsRes] = await Promise.all([
        matchService.getEvents(id).catch(() => ({ data: [] })),
        matchService.getParticipations(id).catch(() => ({ data: [] }))
      ]);
      
      setEvents((eventsRes.data || []).sort((a, b) => b.minute - a.minute));
      setParticipations(partsRes.data || []);
      
    } catch (err) {
      setError("Failed to load match scoring data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await matchService.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      setError("Failed to update fixture status.");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await matchService.addEvent(id, {
        type: eventModal.type,
        playerId: eventData.playerId,
        minute: parseInt(eventData.minute, 10),
        teamId: eventModal.team.id
      });
      setEventModal({ show: false, type: '', team: null });
      setEventData({ playerId: '', minute: '' });
      fetchData();
    } catch (err) {
      setError("Failed to log match event.");
    }
  };

  const handleConfirmMatch = async () => {
    try {
      await matchService.confirm(id, { homeScore: finalScore.home, awayScore: finalScore.away });
      navigate(`/matches/${id}`);
    } catch (err) {
      setError("Failed to verify & confirm final match score.");
    }
  };

  if (loading && !match) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Calibrating live match scoring console..." /></div>;
  if (!match) return <div className="p-6"><Alert type="error" message="Match fixture not found." /></div>;

  const getTeamPlayers = (teamId) => {
    return participations
      .filter(p => p.teamId === teamId)
      .map(p => p.player);
  };

  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => navigate('/matches')} 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Fixtures
        </button>
        <StatusBadge status={match.status} />
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Main Matchday Stadium Scoreboard */}
      <div className="relative overflow-hidden rounded-3xl pitch-turf-stripes text-white shadow-2xl border-2 border-emerald-500/50 p-6 sm:p-10">
        {/* Stadium floodlight canopy */}
        <div className="absolute top-0 inset-x-0 h-44 stadium-glow opacity-80 pointer-events-none" />
        <div className="absolute inset-0 goal-net-texture opacity-35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#051710]/60 to-[#020b07]" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300 mb-6 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-400/50 shadow-md">
            ⚽ {match.tournament?.name || 'Sanctioned Official Match'}
          </span>

          <div className="flex items-center justify-between w-full max-w-2xl my-4">
            {/* Home Team */}
            <div className="text-center w-2/5 space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#04120a] border-2 border-emerald-400/60 mx-auto flex items-center justify-center font-black text-2xl text-emerald-300 shadow-xl">
                {match.homeTeam?.name?.charAt(0) || 'H'}
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight truncate text-white">
                {match.homeTeam?.name || 'Home Club'}
              </h2>
            </div>

            {/* Score */}
            <div className="text-center w-1/5">
              <div className="text-4xl sm:text-6xl font-black stat-number tracking-tighter text-amber-300 drop-shadow-lg">
                {match.homeScore ?? 0} : {match.awayScore ?? 0}
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mt-1">
                {isLive ? '🟢 LIVE ON PITCH' : isCompleted ? 'FULL TIME WHISTLE' : 'SCHEDULED KICKOFF'}
              </span>
            </div>

            {/* Away Team */}
            <div className="text-center w-2/5 space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#04120a] border-2 border-sky-400/60 mx-auto flex items-center justify-center font-black text-2xl text-sky-300 shadow-xl">
                {match.awayTeam?.name?.charAt(0) || 'A'}
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight truncate text-white">
                {match.awayTeam?.name || 'Away Club'}
              </h2>
            </div>
          </div>

          {/* Match Controls */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {match.status === 'SCHEDULED' && (
              <Button 
                variant="success" 
                size="lg"
                onClick={() => handleStatusChange('LIVE')}
                icon={<Play className="w-5 h-5 mr-1" />}
              >
                Kick Off (Start Match)
              </Button>
            )}

            {match.status === 'LIVE' && (
              <Button 
                variant="danger" 
                size="lg"
                onClick={() => handleStatusChange('COMPLETED')}
                icon={<Square className="w-5 h-5 mr-1" />}
              >
                Full Time (End Match)
              </Button>
            )}

            {match.status === 'COMPLETED' && !match.confirmed && (
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setConfirmModal(true)}
                icon={<CheckCircle className="w-5 h-5 mr-1" />}
              >
                Certify & Lock Result
              </Button>
            )}

            {match.confirmed && (
              <div className="bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-bold py-2 px-6 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Match Record Locked & Calibrated
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Matchday Quick Action Triggers (When LIVE) */}
      {isLive && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Home Actions */}
          <div className="bg-white dark:bg-[#0b1e2d] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
              {match.homeTeam?.name || 'Home Team'} Actions
            </h3>
            
            <button 
              onClick={() => setEventModal({ show: true, type: 'GOAL', team: match.homeTeam })}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <span className="text-lg">⚽</span> Log Home Goal
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setEventModal({ show: true, type: 'YELLOW_CARD', team: match.homeTeam })}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center justify-center gap-1.5 active:bg-amber-100"
              >
                <span>🟨</span> Yellow Card
              </button>
              <button 
                onClick={() => setEventModal({ show: true, type: 'RED_CARD', team: match.homeTeam })}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center justify-center gap-1.5 active:bg-rose-100"
              >
                <span>🟥</span> Red Card
              </button>
            </div>
          </div>

          {/* Away Actions */}
          <div className="bg-white dark:bg-[#0b1e2d] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">
              {match.awayTeam?.name || 'Away Team'} Actions
            </h3>
            
            <button 
              onClick={() => setEventModal({ show: true, type: 'GOAL', team: match.awayTeam })}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <span className="text-lg">⚽</span> Log Away Goal
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setEventModal({ show: true, type: 'YELLOW_CARD', team: match.awayTeam })}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center justify-center gap-1.5 active:bg-amber-100"
              >
                <span>🟨</span> Yellow Card
              </button>
              <button 
                onClick={() => setEventModal({ show: true, type: 'RED_CARD', team: match.awayTeam })}
                className="py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center justify-center gap-1.5 active:bg-rose-100"
              >
                <span>🟥</span> Red Card
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Official Match Event Log */}
      <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#071622] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-emerald-500" /> Official Match Log
          </span>
          <span className="text-xs text-slate-400 font-bold stat-number">{events.length} Events</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {events.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No scoring or discipline events registered yet.
            </div>
          ) : (
            events.map((ev, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-extrabold text-sm text-slate-500 dark:text-slate-400 w-10 text-right stat-number">
                    {ev.minute}′
                  </span>
                  <span className="text-lg">
                    {ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : '⏱️'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {ev.player?.name || 'Registered Athlete'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {ev.teamId === match.homeTeam?.id ? match.homeTeam?.name : match.awayTeam?.name}
                    </span>
                  </div>
                </div>
                <StatusBadge status="COMPLETED" label={ev.type.replace('_', ' ')} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal 
        isOpen={eventModal.show} 
        onClose={() => setEventModal({ show: false, type: '', team: null })} 
        title={`Record ${eventModal.type.replace('_', ' ')} for ${eventModal.team?.name}`}
      >
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Select Player
            </label>
            <select 
              required
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white p-2.5"
              value={eventData.playerId}
              onChange={e => setEventData({ ...eventData, playerId: e.target.value })}
            >
              <option value="">-- Choose Athlete --</option>
              {eventModal.team && getTeamPlayers(eventModal.team.id).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {eventModal.team && getTeamPlayers(eventModal.team.id).length === 0 && (
              <p className="text-xs text-rose-500 mt-1">No players verified in this team roster.</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Match Minute (1–120)
            </label>
            <input 
              type="number" 
              required min="1" max="150"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white p-2.5"
              placeholder="e.g. 67"
              value={eventData.minute}
              onChange={e => setEventData({ ...eventData, minute: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEventModal({ show: false, type: '', team: null })}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Event</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Match Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Certify Final Result">
        <div className="space-y-6">
          <Alert type="warning" message="Locking the match will finalize player G/A statistics and trigger GPI rating calibrations. This cannot be undone." />
          
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#071622] border border-slate-200 dark:border-slate-800">
            <div className="text-center w-2/5 space-y-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate block">{match.homeTeam?.name}</span>
              <input 
                type="number" 
                className="w-16 text-center text-2xl font-black p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#081b29] text-slate-900 dark:text-white" 
                value={finalScore.home} 
                onChange={e => setFinalScore({ ...finalScore, home: parseInt(e.target.value, 10) || 0 })} 
              />
            </div>
            <div className="text-lg font-black text-slate-400">-</div>
            <div className="text-center w-2/5 space-y-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate block">{match.awayTeam?.name}</span>
              <input 
                type="number" 
                className="w-16 text-center text-2xl font-black p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#081b29] text-slate-900 dark:text-white" 
                value={finalScore.away} 
                onChange={e => setFinalScore({ ...finalScore, away: parseInt(e.target.value, 10) || 0 })} 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button type="button" variant="primary" onClick={handleConfirmMatch}>Certify & Lock Result</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MatchScoring;
