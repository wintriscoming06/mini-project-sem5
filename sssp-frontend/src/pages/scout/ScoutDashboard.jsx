import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Star, Bell, Eye, Filter, UserCheck, ChevronRight, 
  AlertCircle, GitCompare, Shield, Target, Compass
} from 'lucide-react';
import { scoutService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  LoadingSpinner, Alert, StatsCard, Card, StatusBadge, Button, 
  ScoutTargetIcon, ClassicSoccerBall, PitchHero 
} from '../../components/common';

export default function ScoutDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    shortlist: [],
    alerts: [],
    filters: [],
    observations: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [shortlistRes, alertsRes, filtersRes] = await Promise.all([
          scoutService.getShortlist().catch(() => ({ data: [] })),
          scoutService.getAlerts().catch(() => ({ data: [] })),
          scoutService.getFilters().catch(() => ({ data: [] }))
        ]);
        
        setData({
          shortlist: shortlistRes.data || [],
          alerts: alertsRes.data || [],
          filters: filtersRes.data || [],
          observations: []
        });
      } catch (err) {
        setError('Failed to load scouting intelligence.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Loading tactical scouting board..." /></div>;

  const unreadAlerts = data.alerts.filter(a => !a.read);
  const topShortlist = [...data.shortlist].sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* 1. TACTICAL PITCH HERO */}
      <div className="stagger-1">
        <PitchHero
        title="Tactical Scouting Command"
        subtitle="Live player talent pipeline, quantitative GPI ratings, and 4-pillar scouting dossiers"
        badgeText="TACTICAL DESK • LIVE SCOUTING FEED"
        stats={[
          { label: "SHORTLIST", value: data.shortlist.length },
          { label: "NEW ALERTS", value: unreadAlerts.length },
          { label: "FILTERS", value: data.filters.length },
          { label: "STATUS", value: "ACTIVE" }
        ]}
        actionButtons={
          <>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/compare')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
              icon={<GitCompare className="w-4 h-4" />}
            >
              Head-to-Head Arena
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/search')}
              icon={<Search className="w-4 h-4" />}
            >
              Scout Player Pool
            </Button>
          </>
        }
      >
        {/* Quick Search Bar inside Hero */}
        <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2 max-w-xl mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search talent by player name, academy club, or position..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-emerald-950/90 border border-emerald-400/50 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
            Filter Radar
          </Button>
        </form>
      </PitchHero>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-2">
        <StatsCard 
          title="Shortlisted Prospects" 
          value={data.shortlist.length} 
          icon={<Star className="w-6 h-6 text-amber-400" />} 
          color="amber"
        />
        <StatsCard 
          title="Saved Tactical Filters" 
          value={data.filters.length} 
          icon={<Filter className="w-6 h-6 text-sky-400" />} 
          color="blue"
        />
        <StatsCard 
          title="Unread Match Alerts" 
          value={unreadAlerts.length} 
          icon={<Bell className="w-6 h-6 text-emerald-400" />} 
          color={unreadAlerts.length > 0 ? "amber" : "emerald"}
        />
        <StatsCard 
          title="Scouting Coverage" 
          value="Statewide" 
          icon={<ScoutTargetIcon className="w-6 h-6 text-purple-400" />} 
          color="purple"
        />
      </div>

      {/* 3. MAIN PITCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-3">
        
        {/* Shortlist Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Priority Prospect Pipeline" 
            subtitle="Flagged footballers for live match observations and club scouting"
            showMatchBall={true}
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => navigate('/shortlist')} className="text-emerald-600 dark:text-emerald-400">
                Full Shortlist <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            }
          >
            {topShortlist.length > 0 ? (
              <div className="divide-y divide-emerald-100 dark:divide-emerald-950/60">
                {topShortlist.map(player => (
                  <div key={player.id || player.playerId} className="py-3.5 flex items-center justify-between hover:bg-emerald-500/10 dark:hover:bg-[#082216]/60 px-3 rounded-2xl transition-colors">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                        {(player.name || player.playerName || 'P').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{player.name || player.playerName || 'Athletic Prospect'}</span>
                          <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {player.position || player.primaryPosition || 'FWD'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {player.team || player.teamAcademy || 'Independent Academy'} • {player.age ? `${player.age} yrs` : 'Under-21'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          GPI {player.gpi ? Number(player.gpi).toFixed(1) : '82.0'}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          {player.priority ? `Priority P${player.priority}` : 'Target'}
                        </div>
                      </div>
                      <Link to={`/players/${player.playerId || player.id}`}>
                        <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                          View Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <ClassicSoccerBall className="w-10 h-10 text-emerald-500 animate-football-bounce" />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-white">Shortlist pipeline is clear</p>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1 max-w-sm mx-auto">
                  Browse regional tournaments and player registries to add high-potential footballers to your pipeline.
                </p>
                <Button variant="primary" size="sm" onClick={() => navigate('/search')} className="mt-5">
                  Search Player Registry
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Intelligence Feeds */}
        <div className="space-y-6">
          <Card 
            title="Scouting Alerts Feed" 
            subtitle="Triggered by tactical parameter filters"
            showMatchBall={true}
            headerAction={
              <Link to="/alerts" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                View All
              </Link>
            }
          >
            {data.alerts.length > 0 ? (
              <div className="divide-y divide-emerald-100 dark:divide-emerald-950/60">
                {data.alerts.slice(0, 4).map(alert => (
                  <div key={alert.id} className="py-3 text-xs hover:bg-emerald-500/5 rounded-xl px-2 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ClassicSoccerBall className="w-3.5 h-3.5 text-emerald-500" />
                        {alert.title || 'Talent Match'}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Today'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-emerald-200/70">{alert.message || 'Prospect matched your positional KPI criteria.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ClassicSoccerBall className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-xs font-semibold">No active trigger alerts</p>
                <p className="text-[10px] text-slate-500 mt-1">Set up custom search filters to receive automated prospect notifications.</p>
              </div>
            )}
          </Card>

          {/* Quick Head-to-Head Banner */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/90 to-[#072418] text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none transform translate-x-4 translate-y-4">
              <ClassicSoccerBall className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">Tactical Comparison</div>
              <h4 className="text-lg font-black text-white">Compare Prospects Head-to-Head</h4>
              <p className="text-xs text-emerald-200/80 mt-1 mb-4">
                Analyze up to 4 footballers side-by-side with GPI radar overlays and physical metrics.
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/compare')}
              >
                Launch Comparison Arena
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
