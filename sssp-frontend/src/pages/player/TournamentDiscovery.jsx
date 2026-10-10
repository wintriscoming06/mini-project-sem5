import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Filter, CheckCircle, Trophy, Shield } from 'lucide-react';
import { tournamentService } from '../../services/api';
import { 
  LoadingSpinner, Alert, Card, Button, StatusBadge, EmptyState, 
  TrophyIcon, PitchHero, ClassicSoccerBall 
} from '../../components/common';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentsRes, appsRes] = await Promise.all([
        tournamentService.getAll().catch(() => ({ data: [] })),
        tournamentService.getMyApplications().catch(() => ({ data: [] }))
      ]);
      setTournaments(tournamentsRes.data || []);
      setMyApplications(appsRes.data || []);
    } catch (err) {
      setError('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatus = (tournamentId) => {
    const app = myApplications.find(a => a.tournamentId === tournamentId);
    return app ? app.status : null;
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Searching sanctioned tournaments..." /></div>;

  return (
    <div className="space-y-6">
      
      {/* 1. TOURNAMENT PITCH HERO */}
      <PitchHero
        title="Sanctioned Football Tournaments"
        subtitle="Official league competitions, state cups, and certified scouting showcase fixtures"
        badgeText="SANCTIONED COMPETITIONS BOARD"
        stats={[
          { label: "AVAILABLE", value: tournaments.length },
          { label: "OPEN", value: tournaments.filter(t => t.status === 'OPEN').length },
          { label: "MY ENTRIES", value: myApplications.length },
          { label: "FORMATS", value: "11v11 / 7v7" }
        ]}
        actionButtons={
          <Button 
            variant="secondary" 
            onClick={() => navigate('/my-applications')}
            className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
          >
            Track My Applications ({myApplications.length})
          </Button>
        }
      />

      {error && <Alert type="error" message={error} />}

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white dark:bg-[#071d15] p-4 rounded-2xl shadow-sm border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search competitions by tournament name, pitch venue, or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-[#04120a] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs sm:text-sm rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-[#04120a] text-slate-900 dark:text-white px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="ALL">All Competitions</option>
            <option value="OPEN">Registration Open</option>
            <option value="ONGOING">Live / Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* 3. TOURNAMENT GRID */}
      {filteredTournaments.length === 0 ? (
        <EmptyState 
          title="No tournaments found" 
          message="No active competitions match your current query or filter criteria." 
          icon={<Trophy className="w-10 h-10 text-emerald-500/50" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t) => {
            const appStatus = getApplicationStatus(t.id);
            return (
              <div 
                key={t.id} 
                onClick={() => navigate(`/tournaments/${t.id}`)}
                className="group relative bg-white dark:bg-[#071d15] rounded-2xl shadow-sm border border-emerald-200/80 dark:border-emerald-800/40 overflow-hidden hover:border-emerald-500 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Lawn grass top trim */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-500" />

                <div className="p-6 relative">
                  {/* Subtle goal net texture */}
                  <div className="absolute inset-0 goal-net-texture pointer-events-none opacity-20" />

                  <div className="relative z-10 flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 p-2.5 flex items-center justify-center flex-shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
                        <TrophyIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors" title={t.name}>
                          {t.name}
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                          Sanctioned Event
                        </span>
                      </div>
                    </div>
                    <StatusBadge 
                      status={t.status === 'OPEN' ? 'ACTIVE' : t.status === 'ONGOING' ? 'LIVE' : 'COMPLETED'} 
                      label={t.status} 
                    />
                  </div>
                  
                  <div className="relative z-10 space-y-2 text-xs text-slate-600 dark:text-emerald-100/80 my-4">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">{t.location || t.venue || 'Stadium Location TBA'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-teal-500 flex-shrink-0" />
                      <span>{new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-2 text-sky-500 flex-shrink-0" />
                      <span>{t.ageGroup || 'Open'} • {t.genderCategory || 'All'} • {t.format || '11v11'}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/80 dark:bg-[#04120a] border-t border-emerald-100 dark:border-emerald-950/80 flex items-center justify-between text-xs relative z-10">
                  <div>
                    <span className="text-slate-400 dark:text-emerald-300/60 block text-[10px] uppercase font-bold">Registration Deadline</span>
                    <span className="font-black text-slate-800 dark:text-white stat-number">
                      {new Date(t.registrationDeadline).toLocaleDateString()}
                    </span>
                  </div>

                  {appStatus ? (
                    <span className="inline-flex items-center font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Entered
                    </span>
                  ) : t.status === 'OPEN' ? (
                    <Button 
                      size="sm" 
                      variant="primary"
                      onClick={(e) => { e.stopPropagation(); navigate(`/tournaments/${t.id}`); }}
                    >
                      Apply Roster
                    </Button>
                  ) : (
                    <span className="text-slate-400 font-bold">Closed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
