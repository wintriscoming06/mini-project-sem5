import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { matchService } from '../../services/api';
import { ArrowLeft, Play, Square, CheckCircle, Clock } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

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
      
      // Sort events newest first for log
      setEvents((eventsRes.data || []).sort((a,b) => b.minute - a.minute));
      setParticipations(partsRes.data || []);
      
    } catch (err) {
      setError("Failed to load match data.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await matchService.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      setError("Failed to update status.");
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
      fetchData(); // refresh events and potentially score
    } catch (err) {
      setError("Failed to add event.");
    }
  };

  const handleConfirmMatch = async () => {
    try {
      await matchService.confirm(id, { homeScore: finalScore.home, awayScore: finalScore.away });
      navigate(`/organizer/matches/${id}`);
    } catch (err) {
      setError("Failed to confirm match.");
    }
  };

  if (loading && !match) return <LoadingSpinner fullScreen text="Loading scoring interface..." />;
  if (!match) return <Alert type="error" message="Match not found." />;

  const getTeamPlayers = (teamId) => {
    return participations
      .filter(p => p.teamId === teamId)
      .map(p => p.player);
  };

  const isLive = match.status === 'LIVE';
  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/organizer/matches')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <div className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider inline-block ${
            isLive ? 'bg-red-100 text-red-600' : 
            isCompleted ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-600'
          }`}>
            {match.status}
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {error && <div className="p-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

      {/* Main Scoreboard */}
      <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center w-2/5">
            <h2 className="text-xl font-bold leading-tight truncate">{match.homeTeam?.name}</h2>
          </div>
          <div className="text-center w-1/5">
            <div className="text-4xl font-black tabular-nums tracking-tighter">
              {match.homeScore} - {match.awayScore}
            </div>
          </div>
          <div className="text-center w-2/5">
            <h2 className="text-xl font-bold leading-tight truncate">{match.awayTeam?.name}</h2>
          </div>
        </div>

        {/* Match Controls */}
        <div className="flex justify-center mt-4">
          {match.status === 'SCHEDULED' && (
            <button onClick={() => handleStatusChange('LIVE')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95">
              <Play size={20} fill="currentColor" /> Start Match
            </button>
          )}
          {match.status === 'LIVE' && (
            <button onClick={() => handleStatusChange('COMPLETED')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95">
              <Square size={20} fill="currentColor" /> End Match
            </button>
          )}
          {match.status === 'COMPLETED' && !match.confirmed && (
            <button onClick={() => setConfirmModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transition-transform active:scale-95">
              <CheckCircle size={20} /> Confirm Result
            </button>
          )}
          {match.confirmed && (
            <div className="bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-full flex items-center gap-2">
              Match Locked
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Only when LIVE) */}
      {isLive && (
        <div className="p-4 grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <p className="text-center text-sm font-bold text-gray-500 uppercase">Home Actions</p>
            <button onClick={() => setEventModal({show: true, type: 'GOAL', team: match.homeTeam})} className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:bg-gray-50">
              <span className="text-2xl">⚽</span> <span className="font-bold text-sm">Goal</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEventModal({show: true, type: 'YELLOW_CARD', team: match.homeTeam})} className="bg-white border-2 border-yellow-400 p-2 rounded-xl shadow-sm flex flex-col items-center active:bg-yellow-50">
                <span className="text-xl">🟨</span>
              </button>
              <button onClick={() => setEventModal({show: true, type: 'RED_CARD', team: match.homeTeam})} className="bg-white border-2 border-red-500 p-2 rounded-xl shadow-sm flex flex-col items-center active:bg-red-50">
                <span className="text-xl">🟥</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-center text-sm font-bold text-gray-500 uppercase">Away Actions</p>
            <button onClick={() => setEventModal({show: true, type: 'GOAL', team: match.awayTeam})} className="w-full bg-white border-2 border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:bg-gray-50">
              <span className="text-2xl">⚽</span> <span className="font-bold text-sm">Goal</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setEventModal({show: true, type: 'YELLOW_CARD', team: match.awayTeam})} className="bg-white border-2 border-yellow-400 p-2 rounded-xl shadow-sm flex flex-col items-center active:bg-yellow-50">
                <span className="text-xl">🟨</span>
              </button>
              <button onClick={() => setEventModal({show: true, type: 'RED_CARD', team: match.awayTeam})} className="bg-white border-2 border-red-500 p-2 rounded-xl shadow-sm flex flex-col items-center active:bg-red-50">
                <span className="text-xl">🟥</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Log */}
      <div className="p-4 mt-4">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock size={18} /> Match Log</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No events recorded yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {events.map((ev, idx) => (
                <li key={idx} className="p-3 flex items-center gap-3">
                  <div className="font-mono text-sm font-bold text-gray-500 w-8 text-right">{ev.minute}'</div>
                  <div className="text-xl">
                    {ev.type === 'GOAL' ? '⚽' : ev.type === 'YELLOW_CARD' ? '🟨' : ev.type === 'RED_CARD' ? '🟥' : '⏱️'}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-900 text-sm">{ev.player?.name || 'Unknown Player'}</p>
                    <p className="text-xs text-gray-500">{ev.teamId === match.homeTeam?.id ? match.homeTeam.name : match.awayTeam?.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <Modal isOpen={eventModal.show} onClose={() => setEventModal({show: false, type: '', team: null})} title={`Add ${eventModal.type.replace('_', ' ')}`}>
        <form onSubmit={handleAddEvent} className="space-y-4 py-2">
          <p className="font-medium text-gray-700">{eventModal.team?.name}</p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Player</label>
            <select 
              required
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 text-base focus:ring-blue-500 focus:border-blue-500"
              value={eventData.playerId}
              onChange={e => setEventData({...eventData, playerId: e.target.value})}
            >
              <option value="">-- Choose Player --</option>
              {eventModal.team && getTeamPlayers(eventModal.team.id).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {eventModal.team && getTeamPlayers(eventModal.team.id).length === 0 && (
              <p className="text-xs text-red-500 mt-1">No players available in this team's lineup.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minute</label>
            <input 
              type="number" 
              required min="1" max="150"
              className="w-full border-gray-300 rounded-lg shadow-sm p-3 text-base focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. 45"
              value={eventData.minute}
              onChange={e => setEventData({...eventData, minute: e.target.value})}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEventModal({show: false, type: '', team: null})}>Cancel</Button>
            <Button type="submit" variant="primary">Save Event</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Match Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Final Result">
        <div className="py-4 space-y-6">
          <Alert type="warning" message="Warning: Confirming the match will lock the score and generate statistics. This action cannot be easily undone." />
          
          <div className="flex items-center justify-between gap-4">
            <div className="text-center w-2/5">
              <p className="text-sm font-bold text-gray-600 truncate mb-2">{match.homeTeam?.name}</p>
              <input type="number" className="w-20 text-center text-3xl font-bold p-2 border rounded-xl" value={finalScore.home} onChange={e => setFinalScore({...finalScore, home: parseInt(e.target.value)||0})} />
            </div>
            <div className="text-xl font-bold text-gray-400">-</div>
            <div className="text-center w-2/5">
              <p className="text-sm font-bold text-gray-600 truncate mb-2">{match.awayTeam?.name}</p>
              <input type="number" className="w-20 text-center text-3xl font-bold p-2 border rounded-xl" value={finalScore.away} onChange={e => setFinalScore({...finalScore, away: parseInt(e.target.value)||0})} />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button type="button" variant="primary" onClick={handleConfirmMatch}>Confirm & Lock</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default MatchScoring;
