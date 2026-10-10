import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { Plus, Search, Filter, Calendar, MapPin, Users, Settings, Trophy } from 'lucide-react';
import { Card, Button, StatusBadge, LoadingSpinner, Alert, EmptyState, TrophyIcon } from '../../components/common';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim, CornerFlag } from '../../components/common/FootballIcons';

const OrganizerTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  
  const statusTabs = ['All', 'DRAFT', 'OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'];

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentService.getAll();
      setTournaments(response.data || []);
      setError(null);
    } catch (err) {
      setError("Could not load tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    filter === 'All' ? true : t.status === filter
  );

  const activeTournamentsCount = tournaments.filter(t => t.status === 'OPEN' || t.status === 'ONGOING').length;

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading tournament management index..." /></div>;

  return (
    <div className="space-y-6">
      
      {/* Stadium Pitch Hero */}
      <PitchHero
        title="Sanctioned Competitions & Tournaments"
        subtitle="Manage official league ladders, knockout cups, certified rosters, and match schedules."
        badgeText="COMPETITION DIRECTOR"
        stats={[
          { label: 'Active Leagues', value: activeTournamentsCount },
          { label: 'Total Sanctioned', value: tournaments.length }
        ]}
        actionButtons={
          <Button 
            variant="primary" 
            onClick={() => navigate('/tournaments/create')}
            icon={<Plus className="w-4 h-4 mr-1.5" />}
          >
            Launch Tournament
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Status Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 hide-scrollbar gap-2">
        {statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-xs rounded-lg transition-colors ${
              filter === tab 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <EmptyState 
          icon={<Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
          title={`No ${filter !== 'All' ? filter.toLowerCase() : ''} tournaments found`}
          description={filter === 'All' ? "You haven't created any competitions yet." : `No tournaments currently in ${filter} state.`}
          action={
            <Button onClick={() => navigate('/tournaments/create')}>
              Create Tournament Now
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div 
              key={tournament.id} 
              className="group relative bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/40 overflow-hidden flex flex-col justify-between hover:border-emerald-500/60 hover:shadow-xl transition-all"
            >
              {/* Pitch Grass Top Trim */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600" />
              
              {/* Subtle Goal Net Mesh in Background */}
              <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />

              <div className="p-6 space-y-4 relative z-10">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-amber-500 p-2 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                      <TrophyIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                      {tournament.name}
                    </h3>
                  </div>
                  <StatusBadge status={tournament.status} />
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                    {tournament.ageGroup || 'Open'}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                    {tournament.genderCategory || 'All'}
                  </span>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                    {tournament.format || 'Standard'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-teal-500" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString()} — {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    <span className="truncate">{tournament.venue || tournament.location || 'Stadium TBA'}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-[#071622] border-t border-slate-100 dark:border-slate-800/80 relative z-10 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={() => navigate(`/tournaments/${tournament.id}/manage`)}
                  icon={<Settings className="w-3.5 h-3.5 mr-1" />}
                >
                  Manage Tournament
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default OrganizerTournaments;
