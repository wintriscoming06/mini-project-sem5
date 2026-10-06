import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchService } from '../../services/api';
import { ArrowLeft, Clock, MapPin, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const MatchDetail = () => {
  const { id } = useParams();
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
      setEvents(eventRes.data || []);
      setStats(statRes.data || []);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load match details.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'events', label: 'Match Events' },
    { id: 'participations', label: 'Lineups' },
    { id: 'stats', label: 'Statistics' },
    ...(match?.confirmed ? [{ id: 'corrections', label: 'Corrections' }] : [])
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

  if (loading && !match) return <LoadingSpinner fullScreen text="Loading match..." />;
  if (!match) return <Alert type="error" message="Match not found." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/organizer/matches" className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-grow">
          <h1 className="text-xl font-bold text-gray-500 uppercase text-sm tracking-wider">
            {match.tournament?.name || 'Tournament Match'}
          </h1>
        </div>
        {!match.confirmed && (
          <Link to={`/organizer/matches/${match.id}/scoring`}>
            <Button variant="primary">Score Match</Button>
          </Link>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Scoreboard Card */}
      <Card className="p-8 text-center bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <StatusBadge status={match.status} />
          <div className="flex gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1"><Clock size={16} /> {new Date(match.date).toLocaleString()}</span>
            {match.venue && <span className="flex items-center gap-1"><MapPin size={16} /> {match.venue}</span>}
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-8 md:gap-16">
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-2xl md:text-4xl font-bold truncate w-full">{match.homeTeam?.name || 'Home'}</h2>
          </div>
          
          <div className="flex flex-col items-center px-4">
            {(match.status === 'COMPLETED' || match.status === 'LIVE') ? (
              <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter">
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <div className="text-4xl font-bold text-gray-500">VS</div>
            )}
            {match.confirmed && (
              <span className="mt-4 text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                Final (Confirmed)
              </span>
            )}
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-2xl md:text-4xl font-bold truncate w-full">{match.awayTeam?.name || 'Away'}</h2>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        
        {activeTab === 'events' && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">No events recorded for this match yet.</Card>
            ) : (
              <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-6">
                {events.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[35px] bg-white border-2 border-gray-200 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                      {event.minute}'
                    </span>
                    <Card className="p-4 shadow-sm inline-block min-w-[250px]">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getEventIcon(event.type)}</span>
                        <div>
                          <p className="font-bold text-gray-900">{event.player?.name}</p>
                          <p className="text-xs text-gray-500">{event.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'participations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4 text-center border-b pb-2">{match.homeTeam?.name} Lineup</h3>
              <ul className="space-y-2">
                {participations.filter(p => p.teamId === match.homeTeam?.id).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                    <span>{p.player?.name}</span>
                    <span className="text-xs text-gray-500">{p.isStarting ? 'Starter' : 'Sub'}</span>
                  </li>
                ))}
                {participations.filter(p => p.teamId === match.homeTeam?.id).length === 0 && (
                  <li className="text-gray-500 text-sm text-center py-4">No lineup recorded</li>
                )}
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold text-lg mb-4 text-center border-b pb-2">{match.awayTeam?.name} Lineup</h3>
              <ul className="space-y-2">
                {participations.filter(p => p.teamId === match.awayTeam?.id).map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                    <span>{p.player?.name}</span>
                    <span className="text-xs text-gray-500">{p.isStarting ? 'Starter' : 'Sub'}</span>
                  </li>
                ))}
                {participations.filter(p => p.teamId === match.awayTeam?.id).length === 0 && (
                  <li className="text-gray-500 text-sm text-center py-4">No lineup recorded</li>
                )}
              </ul>
            </Card>
          </div>
        )}

        {activeTab === 'stats' && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Player</th>
                    <th className="px-6 py-3 text-center">⚽ Goals</th>
                    <th className="px-6 py-3 text-center">🅰️ Assists</th>
                    <th className="px-6 py-3 text-center">🟨 Yellows</th>
                    <th className="px-6 py-3 text-center">🟥 Reds</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center">No statistics available yet.</td></tr>
                  ) : (
                    stats.map((stat, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{stat.player?.name}</td>
                        <td className="px-6 py-4 text-center font-bold">{stat.goals || 0}</td>
                        <td className="px-6 py-4 text-center">{stat.assists || 0}</td>
                        <td className="px-6 py-4 text-center">{stat.yellowCards || 0}</td>
                        <td className="px-6 py-4 text-center">{stat.redCards || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'corrections' && match.confirmed && (
          <div className="space-y-4">
            <Alert type="info" message="Corrections can be submitted for confirmed matches if an error is found." />
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Submit Correction</h3>
              <p className="text-sm text-gray-500 mb-4">Feature coming soon. Contact admin for manual corrections.</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetail;
