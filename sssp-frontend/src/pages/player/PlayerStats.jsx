import React, { useState, useEffect } from 'react';
import { BarChart3, Target, AlertCircle, Medal, History, Activity, TrendingUp } from 'lucide-react';
import { playerService } from '../../services/api';
import { LoadingSpinner, Alert, Card, StatsCard, StatusBadge } from '../../components/common';

const PlayerStats = () => {
  const [data, setData] = useState({
    gpi: null,
    performance: null,
    matchStats: [],
    ranking: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [gpiRes, perfRes, matchRes, rankRes] = await Promise.all([
        playerService.getGPI().catch(() => ({ data: null })),
        playerService.getPerformance().catch(() => ({ data: null })),
        playerService.getMatchStats().catch(() => ({ data: [] })),
        playerService.getRanking().catch(() => ({ data: null }))
      ]);

      const history = Array.isArray(perfRes.data) ? perfRes.data : [];
      const sum = (k) => history.reduce((n, h) => n + (h[k] || 0), 0);
      const rankings = Array.isArray(rankRes.data) ? rankRes.data : [];
      const overall = rankings.find((r) => r.context === 'OVERALL');
      const positional = rankings.find((r) => (r.context || '').startsWith('POSITION:'));

      setData({
        gpi: gpiRes.data,
        performance: history.length ? {
          totalMatches: sum('totalMatches'), totalGoals: sum('totalGoals'), totalAssists: sum('totalAssists'),
          yellowCards: sum('totalYellowCards'), redCards: sum('totalRedCards'), totalMinutes: sum('totalMinutesPlayed')
        } : null,
        matchStats: matchRes.data || [],
        ranking: overall || positional ? {
          overallRank: overall?.rankValue,
          position: positional ? positional.context.replace('POSITION:', '') : null,
          positionRank: positional?.rankValue,
          gpiAtRanking: (overall || positional)?.gpiValue != null ? Number((overall || positional).gpiValue).toFixed(1) : null,
          updatedAt: (overall || positional)?.computedAt
        } : null
      });
    } catch (err) {
      setError('Failed to load statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="large" /></div>;

  const { gpi, performance, matchStats, ranking } = data;

  const renderGPIBar = (label, value) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Statistics</h1>
          <p className="text-gray-500">Comprehensive view of your performance and metrics.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'OVERVIEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('OVERVIEW')}
        >
          Performance Overview
        </button>
        <button 
          className={`py-3 px-6 text-sm font-medium border-b-2 ${activeTab === 'HISTORY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('HISTORY')}
        >
          Match History
        </button>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm mb-1">Matches</span>
              <span className="text-2xl font-bold text-gray-900">{performance?.totalMatches || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm mb-1">Goals</span>
              <span className="text-2xl font-bold text-gray-900">{performance?.totalGoals || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm mb-1">Assists</span>
              <span className="text-2xl font-bold text-gray-900">{performance?.totalAssists || 0}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm mb-1">Cards</span>
              <span className="text-2xl font-bold text-gray-900">
                <span className="text-yellow-500">{performance?.yellowCards || 0}</span> / <span className="text-red-500">{performance?.redCards || 0}</span>
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <span className="text-gray-500 text-sm mb-1">Minutes</span>
              <span className="text-2xl font-bold text-gray-900">{performance?.totalMinutes || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPI Section */}
            <Card title={<div className="flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-500"/> GPI Analysis</div>}>
              {gpi ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                    <span className="text-sm font-medium text-indigo-800 mb-2 uppercase tracking-wider">Overall GPI Score</span>
                    <span className="text-6xl font-black text-indigo-600">{Number(gpi.gpi).toFixed(1)}</span>
                    <div className="mt-4 flex gap-2">
                      <StatusBadge status="INFO" label={`Confidence: ${gpi.dataConfidence || 'MEDIUM'}`} />
                      {gpi.provisional && <StatusBadge status="WARNING" label="Provisional" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase">Component Breakdown</h4>
                    {renderGPIBar('Quantitative Score', Math.round(gpi.quantitativeScore || 0))}
                    {renderGPIBar('Consistency', Math.round(gpi.consistency || 0))}
                    {renderGPIBar('Recent Form', Math.round(gpi.recentForm || 0))}
                  </div>
                  
                  {gpi.observationScore ? (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-gray-700 block mb-1">Observation Score</span>
                      <span className="text-lg font-bold text-gray-900">{Math.round(gpi.observationScore)}/100</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-start text-yellow-800 text-sm">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <p>Limited Observation Data. Scout reports will improve metric accuracy.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Not enough match data to calculate GPI.</p>
                </div>
              )}
            </Card>

            {/* Ranking Section */}
            <Card title={<div className="flex items-center"><Medal className="w-5 h-5 mr-2 text-yellow-500"/> Current Ranking</div>}>
              {ranking ? (
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 text-center">
                    <span className="text-sm font-medium text-yellow-800 mb-1 block">Positional Rank ({ranking.position || 'N/A'})</span>
                    <span className="text-5xl font-black text-yellow-600">#{ranking.positionRank || 'N/A'}</span>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-gray-600">Overall Rank</span>
                      <span className="font-bold text-gray-900">#{ranking.overallRank || 'N/A'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-gray-600">GPI at time of ranking</span>
                      <span className="font-medium text-gray-900">{ranking.gpiAtRanking || 'N/A'}</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-sm text-gray-500">{ranking.updatedAt ? new Date(ranking.updatedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Medal className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>Insufficient data for official ranking.</p>
                  <p className="text-xs mt-2">Play more verified matches to get ranked.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <Card className="animate-fadeIn">
          {matchStats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No match history available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mins</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">G/A</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cards</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matchStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stat.matchDescription || `Match #${stat.matchId}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {stat.minutesPlayed !== null ? stat.minutesPlayed : <span className="text-gray-400 text-xs">Not recorded</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <span className="text-green-600">{stat.goals || 0}</span> / <span className="text-blue-600">{stat.assists || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex justify-center space-x-2">
                          {stat.yellowCards > 0 && <span className="w-3 h-4 bg-yellow-400 rounded-sm inline-block"></span>}
                          {stat.redCards > 0 && <span className="w-3 h-4 bg-red-600 rounded-sm inline-block"></span>}
                          {stat.yellowCards === 0 && stat.redCards === 0 && <span className="text-gray-300">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PlayerStats;
