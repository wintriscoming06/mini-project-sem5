import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { matchService } from '../../services/api';
import { Card, Button, StatusBadge, LoadingSpinner, Alert, WhistleIcon, StadiumIcon, FootballIcon } from '../../components/common';
import { Eye, Edit3, CheckCircle, Calendar, Clock, ArrowLeft, Trophy } from 'lucide-react';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim } from '../../components/common/FootballIcons';

const MatchList = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await matchService.getAll();
      setMatches(res.data || []);
    } catch (err) {
      setError("Failed to load match fixtures.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(m => 
    statusFilter === 'ALL' ? true : m.status === statusFilter
  );

  const liveMatchesCount = matches.filter(m => m.status === 'LIVE').length;
  const completedMatchesCount = matches.filter(m => m.status === 'COMPLETED').length;

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading match schedules..." /></div>;

  return (
    <div className="space-y-6">
      
      {/* Stadium Pitch Hero Banner */}
      <PitchHero
        title="Matchday Fixtures & Score Center"
        subtitle="Manage official kickoff schedules, live in-play scoring, referee cards, and certified results."
        badgeText="MATCHDAY OPERATIONS"
        stats={[
          { label: 'Total Fixtures', value: matches.length },
          { label: 'Live In-Play', value: liveMatchesCount },
          { label: 'Certified Final', value: completedMatchesCount }
        ]}
      />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0b1e2d] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-emerald-900/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter By Status:</span>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white py-1.5 px-3"
          >
            <option value="ALL">All Matches</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live Matches</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400">{filteredMatches.length} Fixtures</span>
      </div>

      {/* Matches Table Card */}
      <div className="relative bg-white dark:bg-[#0b1e2d] border border-slate-200 dark:border-emerald-900/40 rounded-2xl shadow-sm overflow-hidden">
        {/* Pitch Grass Top Trim */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600" />
        
        {/* Goal net mesh texture in background */}
        <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />

        <div className="overflow-x-auto relative z-10">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-[#071622] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
              <tr>
                <th className="px-5 py-3.5 text-left">Fixture Match</th>
                <th className="px-5 py-3.5 text-left">Tournament</th>
                <th className="px-5 py-3.5 text-left">Date & Time</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Score</th>
                <th className="px-5 py-3.5 text-center">Verified</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-xs text-slate-400">
                    No fixtures matching current filter.
                  </td>
                </tr>
              ) : (
                filteredMatches.map(match => (
                  <tr key={match.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <ClassicSoccerBall className="w-4 h-4 opacity-70 flex-shrink-0" />
                        <span>{match.homeTeam?.name || 'Home Club'}</span>
                        <span className="text-[10px] font-black text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">vs</span>
                        <span>{match.awayTeam?.name || 'Away Club'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {match.tournament?.name || 'Sanctioned Tournament'}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap stat-number">
                      {match.date ? new Date(match.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={match.status} />
                    </td>
                    <td className="px-5 py-4 text-center font-black text-base stat-number text-slate-900 dark:text-white">
                      {match.status === 'COMPLETED' || match.status === 'LIVE' ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {match.confirmed ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-4 h-4 mr-1" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => navigate(`/matches/${match.id}`)}
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {!match.confirmed && (
                          <Button 
                            size="sm" 
                            variant="primary" 
                            onClick={() => navigate(`/matches/${match.id}/score`)}
                            title="Score Match"
                            icon={Edit3}
                          >
                            Score
                          </Button>

                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MatchList;
