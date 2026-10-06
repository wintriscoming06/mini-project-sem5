import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, TrendingUp, BarChart3, Medal, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playerService, getErrorMessage } from '../../services/api';
import { LoadingSpinner, Alert, StatsCard, Card, StatusBadge, Button } from '../../components/common';

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
        // Profile is required; the rest are optional (a new player has no GPI/ranking/stats yet -> 404).
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

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="large" /></div>;
  if (error) return <div className="p-6"><Alert type="error" message={error} /></div>;

  const { profile, gpi, performance, recentMatches } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile?.fullName || user?.username}!</h1>
          <p className="text-gray-500 mt-1">Here is your latest performance overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/player/profile')}>View Profile</Button>
          <Button onClick={() => navigate('/player/tournaments')}>Browse Tournaments</Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Matches" 
          value={performance?.totalMatches || 0} 
          icon={<Calendar className="w-6 h-6 text-blue-500" />} 
        />
        <StatsCard 
          title="Total Goals" 
          value={performance?.totalGoals || 0} 
          icon={<Target className="w-6 h-6 text-green-500" />} 
        />
        <StatsCard 
          title="Total Assists" 
          value={performance?.totalAssists || 0} 
          icon={<TrendingUp className="w-6 h-6 text-purple-500" />} 
        />
        <StatsCard 
          title="GPI Score" 
          value={gpi ? Number(gpi.gpi).toFixed(1) : 'N/A'} 
          icon={<BarChart3 className="w-6 h-6 text-indigo-500" />} 
          trend={gpi?.trend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Recent Matches">
            {recentMatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minutes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G/A</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentMatches.map((match, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{match.matchDescription || `Match #${match.matchId}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.minutesPlayed ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{match.goals} / {match.assists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent matches found.</div>
            )}
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={() => navigate('/player/stats')} className="flex items-center text-indigo-600">
                View Full History <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <Card title="GPI Breakdown">
            {gpi ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-gray-900">{Number(gpi.gpi).toFixed(1)}</span>
                  <StatusBadge status="INFO" label={`Confidence: ${gpi.dataConfidence || 'MEDIUM'}`} />
                </div>
                
                <div className="space-y-3">
                  {[['Quantitative Score', gpi.quantitativeScore, 'bg-blue-500'],
                    ['Recent Form', gpi.recentForm, 'bg-green-500'],
                    ['Consistency', gpi.consistency, 'bg-purple-500']].map(([label, val, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium">{Math.round(val || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full`} style={{ width: `${Math.min(val || 0, 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">Not enough data for GPI calculation.</div>
            )}
          </Card>

          <Card title="Current Ranking">
            <div className="flex flex-col items-center justify-center p-4">
              <Medal className="w-12 h-12 text-yellow-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Rank #{profile?.ranking || 'N/A'}</h3>
              <p className="text-sm text-gray-500 mt-1 text-center">Among players in your primary position</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
