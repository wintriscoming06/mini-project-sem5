import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tournamentService, matchService } from '../../services/api';
import { 
  Trophy, Calendar, Users, CheckCircle, Plus, ArrowRight, 
  BarChart3, Activity, Shield, MapPin, ChevronRight, Clock 
} from 'lucide-react';
import { 
  StatsCard, Card, StatusBadge, LoadingSpinner, Alert, 
  Button, TrophyIcon, WhistleIcon, StadiumIcon, ClassicSoccerBall, PitchHero 
} from '../../components/common';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentsRes, matchesRes] = await Promise.all([
          tournamentService.getAll().catch(() => ({ data: [] })), 
          matchService.getAll().catch(() => ({ data: [] }))
        ]);
        
        setTournaments(tournamentsRes.data || []);
        setMatches(matchesRes.data || []);
      } catch (err) {
        setError('Failed to load tournament operations data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading matchday stadium operations..." /></div>;

  const activeMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'SCHEDULED');
  const confirmedMatches = matches.filter(m => m.status === 'COMPLETED' && m.confirmed);
  
  let pendingApplicationsCount = 0;
  tournaments.forEach(t => {
    if (t.applications) {
      pendingApplicationsCount += t.applications.filter(a => a.status === 'PENDING').length;
    }
  });

  const recentTournaments = [...tournaments]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 3);
    
  const upcomingMatches = [...matches]
    .filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE')
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* 1. MATCHDAY STADIUM PITCH HERO */}
      <PitchHero
        title="Matchday Operations Console"
        subtitle="Tournament lifecycles, team roster verification, live pitch scoring, and official result certification"
        badgeText="STADIUM OPERATIONS HQ • LEAGUE DESK"
        stats={[
          { label: "TOURNAMENTS", value: tournaments.length },
          { label: "FIXTURES", value: matches.length },
          { label: "PENDING APPS", value: pendingApplicationsCount },
          { label: "CERTIFIED", value: confirmedMatches.length }
        ]}
        actionButtons={
          <>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/matches')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
              icon={<WhistleIcon className="w-4 h-4" />}
            >
              Match Score Desks
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/tournaments/create')}
              icon={<Plus className="w-4 h-4" />}
            >
              Create Tournament
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 font-semibold mt-3">
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            {user?.organization || 'Licensed League Director'}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black">
            <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
            CHAMPIONSHIP TOURNAMENT STADIUM ARENA
          </span>
        </div>
      </PitchHero>

      {error && <Alert type="error" message={error} />}

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Active Competitions" 
          value={tournaments.length} 
          icon={<TrophyIcon className="w-6 h-6 text-amber-400" />} 
          color="amber"
        />
        <StatsCard 
          title="Scheduled Fixtures" 
          value={activeMatches.length} 
          icon={<StadiumIcon className="w-6 h-6 text-sky-400" />} 
          color="blue"
        />
        <StatsCard 
          title="Pending Player Entries" 
          value={pendingApplicationsCount} 
          icon={<Users className="w-6 h-6 text-purple-400" />} 
          color="purple"
        />
        <StatsCard 
          title="Official Certified Matches" 
          value={confirmedMatches.length} 
          icon={<WhistleIcon className="w-6 h-6 text-emerald-400" />} 
          color="emerald"
        />
      </div>

      {/* 3. MAIN PITCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Competitions Board */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Active Football Tournaments" 
            subtitle="Current tournaments under your management"
            showMatchBall={true}
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-tournaments')} className="text-emerald-600 dark:text-emerald-400">
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {recentTournaments.length > 0 ? (
              <div className="divide-y divide-emerald-100 dark:divide-emerald-950/60">
                {recentTournaments.map(t => (
                  <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-emerald-500/10 dark:hover:bg-[#082216]/60 px-3 rounded-2xl transition-colors">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border border-amber-500/30 flex-shrink-0">
                        <TrophyIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{t.name}</h4>
                          <StatusBadge status={t.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1 flex items-center gap-2">
                          <span>{t.format || '11v11'}</span>
                          <span>•</span>
                          <span>{t.ageGroup || 'Open'}</span>
                          <span>•</span>
                          <span className="flex items-center text-slate-400"><MapPin className="w-3 h-3 mr-0.5" />{t.venue || t.location || 'Central Arena'}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                      <Link to={`/organizer/tournaments/${t.id}/manage`}>
                        <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                          Manage Console
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <TrophyIcon className="w-10 h-10 text-amber-500" />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-white">No active tournaments</p>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1 max-w-sm mx-auto">
                  Create your first football competition to schedule matches and receive squad entries.
                </p>
                <Button variant="primary" size="sm" onClick={() => navigate('/tournaments/create')} className="mt-5">
                  Create First Competition
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Upcoming Fixtures & Scoring Shortcuts */}
        <div className="space-y-6">
          <Card 
            title="Fixture Match Desk" 
            subtitle="Immediate matches scheduled for scoring"
            showMatchBall={true}
            headerAction={
              <Link to="/matches" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                All Fixtures
              </Link>
            }
          >
            {upcomingMatches.length > 0 ? (
              <div className="divide-y divide-emerald-100 dark:divide-emerald-950/60">
                {upcomingMatches.map(match => (
                  <div key={match.id} className="py-3.5 text-xs hover:bg-emerald-500/5 rounded-xl px-2 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(match.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <StatusBadge status={match.status} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between my-1">
                      <span className="text-emerald-600 dark:text-emerald-400">{match.homeTeam?.name || 'TBD'}</span>
                      <span className="text-slate-400 font-normal px-2">vs</span>
                      <span className="text-blue-600 dark:text-blue-400">{match.awayTeam?.name || 'TBD'}</span>
                    </div>
                    <div className="mt-2 text-right">
                      <Link to={`/organizer/matches/${match.id}/scoring`}>
                        <Button size="sm" variant="outline" className="text-[11px] py-1 px-2.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                          Open Match Desk ⚽
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ClassicSoccerBall className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-xs font-semibold">No pending fixtures</p>
                <p className="text-[10px] text-slate-500 mt-1">Fixtures scheduled in your tournaments will appear here.</p>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;
