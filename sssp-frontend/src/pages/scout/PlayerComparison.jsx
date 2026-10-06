import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { playerService, scoutService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function PlayerComparison() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const idsParam = queryParams.get('ids');
  const ids = idsParam ? idsParam.split(',').slice(0, 4) : []; // Max 4 players

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    const fetchPlayersData = async () => {
      try {
        setLoading(true);
        const playerPromises = ids.map(async (id) => {
          try {
            const [prof, gpi, obsRes] = await Promise.all([
              playerService.getProfile(id).catch(() => ({ data: {} })),
              playerService.getGPI(id).catch(() => ({ data: {} })),
              scoutService.getObservations(id).catch(() => ({ data: [] }))
            ]);
            
            // Calculate avg ratings if available
            const obs = obsRes.data || [];
            let avgRatings = { tech: '-', tact: '-', phys: '-', psych: '-' };
            if (obs.length > 0) {
              const sum = obs.reduce((acc, o) => ({
                tech: acc.tech + (o.tech || 0), tact: acc.tact + (o.tact || 0),
                phys: acc.phys + (o.phys || 0), psych: acc.psych + (o.psych || 0)
              }), { tech: 0, tact: 0, phys: 0, psych: 0 });
              avgRatings = {
                tech: (sum.tech / obs.length).toFixed(1), tact: (sum.tact / obs.length).toFixed(1),
                phys: (sum.phys / obs.length).toFixed(1), psych: (sum.psych / obs.length).toFixed(1)
              };
            }

            return {
              id,
              profile: prof.data || { name: 'Unknown Player', position: 'N/A' },
              gpi: gpi.data || { value: 0, confidence: 'N/A' },
              avgRatings
            };
          } catch (e) {
            return null;
          }
        });

        const results = await Promise.all(playerPromises);
        setPlayers(results.filter(Boolean));
      } catch (err) {
        setError('Failed to load comparison data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersData();
  }, [idsParam]);

  const removePlayer = (idToRemove) => {
    const newIds = ids.filter(id => id !== idToRemove);
    navigate(`/scout/compare?ids=${newIds.join(',')}`);
  };

  const findHighest = (field, isNested = false, nestedKey = '') => {
    if (players.length <= 1) return null;
    let max = -Infinity;
    players.forEach(p => {
      const val = isNested ? parseFloat(p[field][nestedKey]) : parseFloat(p[field]);
      if (!isNaN(val) && val > max) max = val;
    });
    return max;
  };

  const highestGpi = findHighest('gpi', true, 'value');

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner /></div>;
  if (ids.length === 0) return (
    <div className="max-w-4xl mx-auto p-12 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-bold">No players selected for comparison</h2>
      <Link to="/scout/search" className="text-blue-600 hover:underline mt-2 inline-block">Go to Search</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to="/scout/search" className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Player Comparison</h1>
        </div>
        {players.length < 4 && (
          <Link to="/scout/search" className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Plus className="w-4 h-4 mr-2" /> Add Player
          </Link>
        )}
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 border-b border-r border-gray-200 w-48 font-medium text-gray-500">Metric</th>
              {players.map(p => (
                <th key={p.id} className="p-4 bg-white border-b border-gray-200 min-w-[200px] relative">
                  <button onClick={() => removePlayer(p.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">✕</button>
                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 mb-2">
                      {p.profile.name?.charAt(0) || '?'}
                    </div>
                    <Link to={`/scout/player/${p.id}`} className="font-bold text-gray-900 hover:text-blue-600 text-base">{p.profile.name}</Link>
                    <span className="text-xs text-gray-500 mt-1">{p.profile.position}</span>
                  </div>
                </th>
              ))}
              {Array.from({ length: 4 - players.length }).map((_, i) => (
                <th key={`empty-${i}`} className="p-4 bg-gray-50/50 border-b border-gray-200 min-w-[200px] text-center align-middle">
                  <span className="text-gray-400 text-sm">Empty Slot</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Core Stats */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Age</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.profile.age || '-'}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            
            {/* System Metrics */}
            <tr className="bg-purple-50/30">
              <td className="p-4 bg-purple-50 border-b border-r border-gray-200 font-medium text-purple-900">GPI Value</td>
              {players.map(p => {
                const isHighest = parseFloat(p.gpi.value) === highestGpi && highestGpi > 0;
                return (
                  <td key={p.id} className={`p-4 border-b border-gray-200 text-center font-bold text-lg ${isHighest ? 'text-green-600 bg-green-50' : 'text-gray-900'}`}>
                    {p.gpi.value || '-'}
                  </td>
                );
              })}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Data Confidence</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.gpi.confidence || '-'}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>

            {/* Performance - Mocked for visual completeness */}
            <tr>
              <td className="p-4 bg-green-50 border-b border-r border-gray-200 font-medium text-green-900">Goals per Match</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.profile.gpm || '-'}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Verified Matches</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.profile.verifiedMatches || '-'}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>

            {/* Observation Ratings */}
            <tr className="bg-orange-50/30">
              <td colSpan={players.length + (4 - players.length) + 1} className="p-2 border-b border-gray-200 text-xs font-bold text-center text-orange-800 uppercase tracking-wider">
                Average Observation Ratings
              </td>
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Technical</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.avgRatings.tech}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Tactical</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.avgRatings.tact}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Physical</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.avgRatings.phys}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 font-medium">Psychosocial</td>
              {players.map(p => <td key={p.id} className="p-4 border-b border-gray-200 text-center">{p.avgRatings.psych}</td>)}
              {Array.from({ length: 4 - players.length }).map((_, i) => <td key={i} className="p-4 border-b border-gray-200 bg-gray-50/50"></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
