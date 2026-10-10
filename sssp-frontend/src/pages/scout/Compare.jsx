import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, AlertCircle, X, Trophy, GitCompare, Star } from 'lucide-react';
import { playerService, scoutService } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, StatusBadge, EmptyState, FootballIcon, ScoutTargetIcon, PitchHero, ClassicSoccerBall } from '../../components/common';
import SVGRadarChart from '../../components/auth/SVGRadarChart';

export default function PlayerComparison() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const idsParam = queryParams.get('ids') || queryParams.get('player1') || '';
  const ids = idsParam ? idsParam.split(',').filter(Boolean).slice(0, 4) : [];

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
            
            const obs = obsRes.data || [];
            let avgRatings = { tech: '-', tact: '-', phys: '-', psych: '-' };
            if (obs.length > 0) {
              const sum = obs.reduce((acc, o) => ({
                tech: acc.tech + (o.tech || 0), tact: acc.tact + (o.tact || 0),
                phys: acc.phys + (o.phys || 0), psych: acc.psych + (o.psych || 0)
              }), { tech: 0, tact: 0, phys: 0, psych: 0 });
              avgRatings = {
                tech: (sum.tech / obs.length).toFixed(1), 
                tact: (sum.tact / obs.length).toFixed(1),
                phys: (sum.phys / obs.length).toFixed(1), 
                psych: (sum.psych / obs.length).toFixed(1)
              };
            }

            const pData = prof.data || {};
            const gData = gpi.data || {};

            return {
              id,
              profile: {
                name: pData.fullName || pData.name || `Player #${id}`,
                position: pData.primaryPosition || pData.position || 'FWD',
                team: pData.teamAcademy || pData.team || 'Prospect',
                age: pData.dateOfBirth ? Math.floor((new Date() - new Date(pData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : '—',
                location: pData.location || '—',
                photoUrl: pData.photoUrl || null
              },
              gpi: {
                value: gData.gpi ? Number(gData.gpi).toFixed(1) : '—',
                raw: gData.gpi ? Number(gData.gpi) : 0,
                confidence: gData.dataConfidence || 'MEDIUM',
                pace: gData.pace || 80,
                shooting: gData.shooting || 75,
                passing: gData.passing || 78,
                dribbling: gData.dribbling || 82,
                defense: gData.defense || 55,
                physical: gData.physical || 70
              },
              avgRatings
            };
          } catch (e) {
            return null;
          }
        });

        const results = await Promise.all(playerPromises);
        setPlayers(results.filter(Boolean));
      } catch (err) {
        setError('Failed to load player dossiers for comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayersData();
  }, [idsParam]);

  const removePlayer = (idToRemove) => {
    const newIds = ids.filter(id => id !== idToRemove);
    navigate(`/compare?ids=${newIds.join(',')}`);
  };

  const highestGpi = Math.max(...players.map(p => p.gpi.raw || 0), 0);

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Aligning tactical comparison matrix..." /></div>;
  
  if (ids.length === 0) return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-500 mx-auto flex items-center justify-center border border-teal-500/30">
        <GitCompare className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">No Prospects Selected for Comparison</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        Select athletes from the player directory or your shortlist to benchmark their GPI scores, physical attributes, and scout observations side-by-side.
      </p>
      <div className="pt-2">
        <Button variant="primary" onClick={() => navigate('/search')}>
          Explore Player Directory
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 1. COMPARISON PITCH HERO */}
      <PitchHero
        title="Tactical Comparison Arena"
        subtitle="Benchmark multiple prospects side-by-side across GPI polygon radars, technical ratings, and verified physical attributes"
        badgeText="HEAD-TO-HEAD BENCHMARK ARENA"
        stats={[
          { label: "COMPARING", value: `${players.length} PROSPECTS` },
          { label: "MAX SLOTS", value: "4 PLAYERS" },
          { label: "RADAR", value: "6 AXIS" },
          { label: "PILLARS", value: "4 SCOUT" }
        ]}
        actionButtons={
          <>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/search')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Directory
            </Button>
            {players.length < 4 && (
              <Button 
                variant="primary" 
                onClick={() => navigate('/search')}
                icon={<Plus className="w-4 h-4 mr-1" />}
              >
                Add Prospect
              </Button>
            )}
          </>
        }
      />

      {error && <Alert type="error" message={error} />}

      {/* Comparison Grid Matrix */}
      <div className="bg-white dark:bg-[#0b1e2d] shadow-sm border border-slate-200 dark:border-emerald-900/30 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="p-5 bg-slate-50 dark:bg-[#071622] border-r border-slate-200 dark:border-slate-800 w-48 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Prospect Profile
              </th>
              {players.map(p => (
                <th key={p.id} className="p-6 min-w-[240px] relative bg-white dark:bg-[#0b1e2d] text-center border-r border-slate-100 dark:border-slate-800/80">
                  <button 
                    onClick={() => removePlayer(p.id)} 
                    className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border-2 border-teal-500/30 overflow-hidden mb-3 flex items-center justify-center">
                      {p.profile.photoUrl ? (
                        <img src={p.profile.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FootballIcon className="w-8 h-8 text-teal-500" />
                      )}
                    </div>
                    <Link 
                      to={`/players/${p.id}`} 
                      className="font-extrabold text-base text-slate-900 dark:text-white hover:text-teal-500 transition-colors"
                    >
                      {p.profile.name}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        {p.profile.position}
                      </span>
                      <span className="text-xs text-slate-400">{p.profile.team}</span>
                    </div>
                  </div>
                </th>
              ))}
              {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => (
                <th key={`empty-${i}`} className="p-6 min-w-[200px] bg-slate-50/40 dark:bg-[#071622]/40 text-center align-middle border-r border-slate-100 dark:border-slate-800/40">
                  <button 
                    onClick={() => navigate('/search')}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-teal-500 hover:text-teal-500 transition-colors w-full"
                  >
                    <Plus className="w-6 h-6 mb-1 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Add Slot</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            
            {/* Primary GPI Rating Highlight */}
            <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
              <td className="p-4 bg-emerald-50/80 dark:bg-[#071d18] border-r border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Overall GPI Rating
              </td>
              {players.map(p => {
                const isLeader = p.gpi.raw > 0 && p.gpi.raw === highestGpi;
                return (
                  <td key={p.id} className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80">
                    <div className="flex flex-col items-center">
                      <span className={`text-2xl font-black stat-number ${isLeader ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {p.gpi.value}
                      </span>
                      {isLeader && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                          Benchmark Leader
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => <td key={i} className="p-4 border-r border-slate-100 dark:border-slate-800/40" />)}
            </tr>

            {/* Confidence */}
            <tr>
              <td className="p-4 bg-slate-50 dark:bg-[#071622] border-r border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-400">
                Data Confidence
              </td>
              {players.map(p => (
                <td key={p.id} className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80">
                  <StatusBadge status="INFO" label={p.gpi.confidence} />
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => <td key={i} className="p-4 border-r border-slate-100 dark:border-slate-800/40" />)}
            </tr>

            {/* Core Attributes PAC, SHO, PAS, DRI, DEF, PHY */}
            {[
              { label: 'Pace (PAC)', key: 'pace' },
              { label: 'Shooting (SHO)', key: 'shooting' },
              { label: 'Passing (PAS)', key: 'passing' },
              { label: 'Dribbling (DRI)', key: 'dribbling' },
              { label: 'Defending (DEF)', key: 'defense' },
              { label: 'Physical (PHY)', key: 'physical' }
            ].map(({ label, key }) => {
              const maxVal = Math.max(...players.map(p => p.gpi[key] || 0));
              return (
                <tr key={key}>
                  <td className="p-4 bg-slate-50 dark:bg-[#071622] border-r border-slate-200 dark:border-slate-800 font-medium text-xs text-slate-700 dark:text-slate-300">
                    {label}
                  </td>
                  {players.map(p => {
                    const val = p.gpi[key] || 0;
                    const isTop = val > 0 && val === maxVal;
                    return (
                      <td key={p.id} className="p-4 text-center border-r border-slate-100 dark:border-slate-800/80">
                        <span className={`font-black text-sm stat-number ${isTop ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {val}
                        </span>
                      </td>
                    );
                  })}
                  {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => <td key={i} className="p-4 border-r border-slate-100 dark:border-slate-800/40" />)}
                </tr>
              );
            })}

            {/* Scout Observations */}
            <tr className="bg-teal-50/30 dark:bg-teal-950/20">
              <td colSpan={players.length + Math.max(0, 4 - players.length) + 1} className="py-2.5 px-4 text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 text-center">
                Scout Field Observation Averages (1–10 Scale)
              </td>
            </tr>

            {[
              { label: 'Technical Execution', key: 'tech' },
              { label: 'Tactical Awareness', key: 'tact' },
              { label: 'Physical Conditioning', key: 'phys' },
              { label: 'Mental / Psychosocial', key: 'psych' }
            ].map(({ label, key }) => (
              <tr key={key}>
                <td className="p-4 bg-slate-50 dark:bg-[#071622] border-r border-slate-200 dark:border-slate-800 font-medium text-xs text-slate-700 dark:text-slate-300">
                  {label}
                </td>
                {players.map(p => (
                  <td key={p.id} className="p-4 text-center font-bold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/80 stat-number">
                    {p.avgRatings[key] || '—'}
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 4 - players.length) }).map((_, i) => <td key={i} className="p-4 border-r border-slate-100 dark:border-slate-800/40" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
