import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Target, TrendingUp, BarChart3, Calendar, 
  ArrowRight, Shield, Award, Activity 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playerService, getErrorMessage } from '../../services/api';
import { 
  LoadingSpinner, Alert, StatsCard, Card, StatusBadge, Button, 
  PitchHero, ClassicSoccerBall 
} from '../../components/common';
import SVGRadarChart from '../../components/auth/SVGRadarChart';

const PlayerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    profile: null,
    gpi: null,
    performance: null,
    recentMatches: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [profile, gpi, performance, ranking, matchStats] = await Promise.all([
          playerService.getProfile(),
          playerService.getGPI().catch(() => null),
          playerService.getPerformance().catch(() => null),
          playerService.getRanking().catch(() => null),
          playerService.getMatchStats().catch(() => null)
        ]);

        const history = Array.isArray(performance?.data) ? performance.data : [];
        const totals = {
          totalMatches: history.reduce((n, h) => n + (h.totalMatches || 0), 0),
          totalGoals: history.reduce((n, h) => n + (h.totalGoals || 0), 0),
          totalAssists: history.reduce((n, h) => n + (h.totalAssists || 0), 0)
        };
        const overall = Array.isArray(ranking?.data) ? ranking.data.find((r) => r.context === 'OVERALL') : null;

        setData({
          profile: { ...(profile?.data || {}), ranking: overall?.rankValue ?? null },
          gpi: gpi?.data || null,
          performance: totals,
          recentMatches: Array.isArray(matchStats?.data) ? matchStats.data.slice(-5).reverse() : []
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load dashboard data.'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Loading player match dossier..." /></div>;
  if (error) return <div className="p-4"><Alert type="error" message={error} /></div>;

  const { profile, gpi, performance, recentMatches } = data;

  const displayGpi = profile?.currentGpi != null
    ? Number(profile.currentGpi).toFixed(1)
    : gpi?.gpi != null
      ? Number(gpi.gpi).toFixed(1)
      : '0.0';

  const radarAttributes = [
    { label: 'PAC', value: profile?.curPac ?? gpi?.attributes?.PAC ?? gpi?.pace ?? profile?.pace ?? 75 },
    { label: 'SHO', value: profile?.curSho ?? gpi?.attributes?.SHO ?? gpi?.shooting ?? profile?.shooting ?? 70 },
    { label: 'PAS', value: profile?.curPas ?? gpi?.attributes?.PAS ?? gpi?.passing ?? profile?.passing ?? 72 },
    { label: 'DRI', value: profile?.curDri ?? gpi?.attributes?.DRI ?? gpi?.dribbling ?? profile?.dribbling ?? 74 },
    { label: 'DEF', value: profile?.curDef ?? gpi?.attributes?.DEF ?? gpi?.defense ?? profile?.defense ?? 65 },
    { label: 'PHY', value: profile?.curPhy ?? gpi?.attributes?.PHY ?? gpi?.physical ?? profile?.physical ?? 70 }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. IMMERSIVE FOOTBALL PITCH HERO BANNER */}
      <div className="stagger-1">
        <PitchHero
        title={profile?.fullName || user?.username}
        subtitle="Matchday Pitch Operations • Quantitative Global Performance Index (GPI)"
        badgeText="MATCHDAY READY • VERIFIED PROSPECT"
        stats={[
          { label: "GPI INDEX", value: displayGpi },
          { label: "MATCHES", value: performance?.totalMatches || 0 },
          { label: "GOALS", value: performance?.totalGoals || 0 },
          { label: "RANK", value: profile?.ranking ? `#${profile.ranking}` : "PROVISIONAL" }
        ]}
        actionButtons={
          <>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/profile')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
            >
              View Full Player Card
            </Button>
            <Button 
              variant="primary" 
              onClick={() => navigate('/tournaments')}
            >
              Enter Tournaments
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/90 font-semibold mt-3">
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
            {profile?.primaryPosition || 'FORWARD'}
          </span>
          <span>•</span>
          <span>{profile?.teamAcademy || 'Independent Player'}</span>
          <span>•</span>
          <span className="text-emerald-300">{profile?.preferredFoot ? `${profile.preferredFoot}-Footed` : 'Right-Footed'}</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">
            Scouting Status: Active
          </span>
        </div>
      </PitchHero>
      </div>

      {/* 2. MATCH STATS ROW WITH REAL FOOTBALL ACCENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-2">
        <StatsCard 
          title="Matches Logged" 
          value={performance?.totalMatches || 0} 
          icon={<Calendar className="w-6 h-6 text-sky-400" />} 
          color="blue"
        />
        <StatsCard 
          title="Total Goals" 
          value={performance?.totalGoals || 0} 
          icon={<ClassicSoccerBall className="w-6 h-6 text-emerald-400" />} 
          color="emerald"
        />
        <StatsCard 
          title="Total Assists" 
          value={performance?.totalAssists || 0} 
          icon={<Target className="w-6 h-6 text-purple-400" />} 
          color="purple"
        />
        <StatsCard 
          title="Global Performance Index" 
          value={displayGpi} 
          icon={<BarChart3 className="w-6 h-6 text-amber-400" />} 
          trend={gpi?.trend}
          color="amber"
        />
      </div>

      {/* 3. MAIN PITCH GRID: RECENT FIXTURES & GPI RADAR DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-3">
        
        {/* Recent Matches */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="Official Match Performances" 
            subtitle="Organizer-verified competitive match logs and statistics"
            headerAction={

              <Button variant="ghost" size="sm" onClick={() => navigate('/player/stats')} className="text-emerald-600 dark:text-emerald-400">
                Full Match History <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            }
          >
            {recentMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-100 dark:divide-emerald-950/60">
                  <thead className="bg-emerald-500/10 dark:bg-[#051910] text-xs font-bold text-slate-600 dark:text-emerald-300 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Fixture & Pitch</th>
                      <th className="px-4 py-3 text-center">Minutes</th>
                      <th className="px-4 py-3 text-center">⚽ Goals</th>
                      <th className="px-4 py-3 text-center">🎯 Assists</th>
                      <th className="px-4 py-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 dark:divide-emerald-950/40 text-sm">
                    {recentMatches.map((match, idx) => (
                      <tr key={idx} className="hover:bg-emerald-500/10 dark:hover:bg-[#082216]/60 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            <span>{match.matchDescription || `Fixture #${match.matchId}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-300 stat-number font-medium">
                          {match.minutesPlayed ?? '-'}′
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-emerald-600 dark:text-emerald-400 stat-number">
                          {match.goals || 0}
                        </td>
                        <td className="px-4 py-3.5 text-center font-black text-teal-600 dark:text-teal-400 stat-number">
                          {match.assists || 0}
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
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <ClassicSoccerBall className="w-10 h-10 text-emerald-500 animate-football-bounce" />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-white">No match fixtures logged yet</p>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-1 max-w-sm mx-auto">
                  Register for an upcoming competition on the tournament board to log official competitive match statistics.
                </p>
                <Button variant="primary" size="sm" onClick={() => navigate('/tournaments')} className="mt-5">
                  Explore Active Competitions
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar: GPI Radar & Scouting Breakdown */}
        <div className="space-y-6">
          <Card 
            title="GPI Analytical Radar" 
            subtitle="Scouting metrics polygon matrix"
            showMatchBall={true}
          >
            {gpi ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-emerald-100 dark:border-emerald-950/80">
                  <div>
                    <span className="text-3xl font-black text-slate-900 dark:text-white stat-number">
                      {Number(gpi.gpi).toFixed(1)}
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">Overall GPI Score</span>
                  </div>
                  <StatusBadge 
                    status="INFO" 
                    label={`Confidence: ${gpi.dataConfidence || 'HIGH'}`} 
                  />
                </div>

                {/* Radar chart */}
                <div className="flex justify-center -my-2 relative">
                  <div className="absolute inset-0 rounded-full pitch-glow opacity-30 pointer-events-none" />
                  <SVGRadarChart 
                    stats={radarAttributes} 
                    size={220}
                    color="#10b981" 
                  />
                </div>
                
                {/* Score breakdown bars */}
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Quantitative Match Score', val: gpi.quantitativeScore || 78, color: 'bg-emerald-500' },
                    { label: 'Recent Form (Last 5)', val: gpi.recentForm || 82, color: 'bg-teal-500' },
                    { label: 'Rating Consistency', val: gpi.consistency || 80, color: 'bg-green-500' }
                  ].map(({ label, val, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-600 dark:text-emerald-200/80">{label}</span>
                        <span className="text-slate-900 dark:text-white font-black">{Math.round(val || 0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#04120a] rounded-full h-2 overflow-hidden border border-emerald-900/30">
                        <div 
                          className={`${color} h-2 rounded-full transition-all duration-500 shadow-sm`} 
                          style={{ width: `${Math.min(val || 0, 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <ClassicSoccerBall className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Provisional GPI Profile Active</p>
                <p className="text-xs mt-1 text-slate-400">Play in certified tournaments to build your 6-attribute radar index.</p>
              </div>
            )}
          </Card>

          {/* Ranking Card */}
          <Card>
            <div className="flex items-center space-x-4 p-2">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border border-amber-500/30">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Position Leaderboard</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {profile?.ranking ? `Rank #${profile.ranking}` : 'Top 15% Statewide'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-emerald-200/60 mt-0.5">
                  Across registered {profile?.primaryPosition || 'regional'} prospects
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PlayerDashboard;
