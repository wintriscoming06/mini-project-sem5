import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playerService, scoutService } from '../../services/api';
import { 
  User, Activity, Star, Award, MapPin, Calendar, ClipboardList, 
  Send, Edit, Bookmark, ArrowLeft, Shield, CheckCircle2, GitCompare,
  Ruler, Scale, Shirt, Footprints, Globe, Trophy
} from 'lucide-react';
import { LoadingSpinner, Alert, Button, StatusBadge, PitchMarkings } from '../../components/common';
import SVGRadarChart from '../../components/auth/SVGRadarChart';
import { useAuth } from '../../context/AuthContext';
import { 
  getClubTheme, ClubCrest, ClubWatermark, PlayerSilhouette, 
  getStoredClubBadge, getStoredPlayerPhysicals, calculateAge 
} from '../../utils/clubTheme';



export default function PlayerView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    profile: null, gpi: null, matchStats: [], ranking: null, observations: [], notes: []
  });
  
  const [obsForm, setObsForm] = useState({ matchId: '', tech: 4, tact: 4, phys: 4, psych: 4, comments: '' });
  const [submittingObs, setSubmittingObs] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined' || id === 'null') {
      setError('Invalid player identifier. Please return to the scouting directory.');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [profile, gpi, stats, ranking, obs, notes] = await Promise.all([
          playerService.getProfile(id).catch(err => {
            console.error('Failed to load profile for id:', id, err);
            return { data: null };
          }),
          playerService.getGPI(id).catch(() => ({ data: {} })),
          playerService.getMatchStats(id).catch(() => ({ data: [] })),
          playerService.getRanking(id).catch(() => ({ data: {} })),
          scoutService.getObservations(id).catch(() => ({ data: [] })),
          scoutService.getNotes(id).catch(() => ({ data: [] }))
        ]);

        const rawProfile = profile?.data;
        const profileData = rawProfile?.player || rawProfile;

        if (!profileData || Object.keys(profileData).length === 0) {
          setError(`Prospect dossier could not be found for player ID: ${id}`);
          setLoading(false);
          return;
        }

        setData({
          profile: profileData, 
          gpi: gpi?.data || {}, 
          matchStats: Array.isArray(stats?.data) ? stats.data : [], 
          ranking: ranking?.data || {}, 
          observations: Array.isArray(obs?.data) ? obs.data : [], 
          notes: Array.isArray(notes?.data) ? notes.data : []
        });
      } catch (err) {
        setError('Failed to load prospect dossier.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleObsSubmit = async (e) => {
    e.preventDefault();
    setSubmittingObs(true);
    try {
      await scoutService.submitObservation(id, obsForm);
      setData(prev => ({
        ...prev, 
        observations: [...prev.observations, { ...obsForm, createdAt: new Date(), scoutName: user?.name || user?.username }]
      }));
      setObsForm({ matchId: '', tech: 4, tact: 4, phys: 4, psych: 4, comments: '' });
    } catch (err) {
      alert("Failed to submit field observation.");
    } finally {
      setSubmittingObs(false);
    }
  };

  const toggleShortlist = async () => {
    try {
      if (isShortlisted) {
        await scoutService.removeFromShortlist(id);
      } else {
        await scoutService.addToShortlist(id);
      }
      setIsShortlisted(!isShortlisted);
    } catch (err) {
      alert("Failed to update shortlist status.");
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Retrieving complete prospect dossier..." /></div>;
  if (error || !data.profile) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <Alert type="error" message={error || "Player dossier not found."} />
        <Button variant="outline" onClick={() => navigate('/search')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Player Directory
        </Button>
      </div>
    );
  }

  const p = data.profile?.player || data.profile || {};
  const g = data.gpi || {};
  const s = data.matchStats || [];

  const radarStats = [
    { label: 'PAC', value: g?.pace || 82 },
    { label: 'SHO', value: g?.shooting || 80 },
    { label: 'PAS', value: g?.passing || 79 },
    { label: 'DRI', value: g?.dribbling || 84 },
    { label: 'DEF', value: g?.defense || 56 },
    { label: 'PHY', value: g?.physical || 75 }
  ];

  const clubTheme = getClubTheme(p.teamAcademy || p.team);
  const targetId = p.id || p.userId || id;
  const customBadgeUrl = getStoredClubBadge(targetId) || getStoredClubBadge(p.userId) || getStoredClubBadge(p.id) || getStoredClubBadge(id);
  const primaryPos = p.primaryPosition || p.position || 'FWD';
  const secondaryPos = p.secondaryPosition;
  const physicals = getStoredPlayerPhysicals(targetId) || getStoredPlayerPhysicals(p.userId) || getStoredPlayerPhysicals(p.id) || getStoredPlayerPhysicals(id);
  const age = calculateAge(p.dateOfBirth);
  const totalMatches = s?.length || 0;
  const totalGoals = s?.reduce((acc, m) => acc + (m.goalsScored || m.goals || 0), 0) || 0;
  const totalAssists = s?.reduce((acc, m) => acc + (m.assists || 0), 0) || 0;

  return (
    <div className="space-y-6">
      
      {/* Back button & Quick Action Bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/search')} 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-teal-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Player Directory
        </button>

        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate(`/compare?player1=${id}`)}
            icon={GitCompare}
          >
            Compare Prospect
          </Button>
          <Button 
            variant={isShortlisted ? 'success' : 'outline'} 
            size="sm"
            onClick={toggleShortlist}
            icon={Bookmark}
          >
            {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PROFESSIONAL PLAYER-CARD PROFILE BANNER (JAMES TRAFFORD REFERENCE) */}
      {/* ======================================================== */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${clubTheme.border} shadow-2xl bg-gradient-to-br ${clubTheme.bgGradient} text-white transition-all duration-700`}>
        
        {/* Subtle Pitch Markings in Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <PitchMarkings />
        </div>

        {/* Large Visible Club Crest Watermark Behind Player */}
        <ClubWatermark 
          club={clubTheme} 
          customBadgeUrl={customBadgeUrl} 
          className="w-72 h-72 sm:w-96 sm:h-96 -left-10 sm:left-4 -top-8 sm:-top-10 opacity-40 dark:opacity-40 sm:opacity-45" 
        />

        {/* Stadium Floodlight Overhead Canopy */}
        <div className="absolute top-0 inset-x-0 h-48 stadium-glow opacity-60 pointer-events-none" />

        {/* Dynamic Club Accent Light Glow */}
        <div 
          className="absolute -top-20 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none" 
          style={{ backgroundColor: clubTheme.accent }}
        />

        {/* Top Header Bar: Club Identity & GPI Score */}
        <div className="relative z-10 px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-sm">
            <ClubCrest club={clubTheme} customBadgeUrl={customBadgeUrl} className="w-6 h-6" />
            <div className="leading-tight">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 block">
                {clubTheme.type}
              </span>
              <span className="text-xs font-black text-white truncate max-w-[180px] block">
                {clubTheme.name}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-lg">
              <span className="text-[10px] uppercase font-black text-slate-400">GPI</span>
              <span className="text-lg font-black text-amber-300 stat-number">
                {g?.gpi ? Number(g.gpi).toFixed(1) : g?.value || '84.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Showcase Body: Unconstrained Transparent Cutout + Compact Details */}
        <div className="relative z-10 px-6 pt-2 pb-5 flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-8">
          
          {/* Transparent Player Cutout Standing Naturally */}
          <div className="relative flex items-end justify-center flex-shrink-0 w-44 sm:w-52 lg:w-60 h-60 sm:h-72 lg:h-80 -mb-2 group select-none">
            {p.photoUrl ? (
              <img 
                src={p.photoUrl} 
                alt={p.fullName || 'Prospect Cutout'} 
                className="h-full w-full object-contain object-bottom filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="h-full w-full flex items-end justify-center pb-2">
                <PlayerSilhouette className="h-full w-48 text-emerald-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" />
              </div>
            )}
          </div>

          {/* Compact Player Information Grid */}
          <div className="flex-1 w-full space-y-3 text-center md:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  {p.fullName || p.name || 'Athletic Prospect'}
                </h1>
                {data.ranking?.overallRank && (
                  <span className="inline-flex items-center text-xs font-black bg-amber-500/25 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full shadow-sm">
                    <Trophy className="w-3 h-3 mr-1 text-amber-400" /> Rank #{data.ranking.overallRank}
                  </span>
                )}
              </div>

              {/* Subtitle Ribbon: Club • Age • Country • Primary Position • Shirt # */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-300 font-semibold mt-1">
                <span className="text-white font-bold">{clubTheme.name}</span>
                <span>•</span>
                <span>{age ? `${age} years old` : (p.dateOfBirth || 'Age Unset')}</span>
                <span>•</span>
                <span>{physicals.country || p.location || 'Region Unspecified'}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">{primaryPos}</span>
                {physicals.jerseyNumber && (
                  <>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">#{physicals.jerseyNumber}</span>
                  </>
                )}
              </div>
            </div>

            {/* Compact 6-Pill Physical Attributes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl bg-black/35 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
              
              {/* Height */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                  <Ruler className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Height</span>
                  <span className="text-xs font-black text-white stat-number mt-0.5 block">
                    {physicals.height ? `${physicals.height} cm` : '—'}
                  </span>
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Weight</span>
                  <span className="text-xs font-black text-white stat-number mt-0.5 block">
                    {physicals.weight ? `${physicals.weight} kg` : '—'}
                  </span>
                </div>
              </div>

              {/* Shirt Number */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                  <Shirt className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Shirt</span>
                  <span className="text-xs font-black text-white stat-number mt-0.5 block">
                    {physicals.jerseyNumber ? `#${physicals.jerseyNumber}` : '—'}
                  </span>
                </div>
              </div>

              {/* Preferred Foot */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                  <Footprints className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Pref Foot</span>
                  <span className="text-xs font-black text-white mt-0.5 block">
                    {p.preferredFoot || 'Right'}
                  </span>
                </div>
              </div>

              {/* Country */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-sky-300">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Country</span>
                  <span className="text-xs font-black text-white truncate max-w-[90px] mt-0.5 block">
                    {physicals.country || p.location || '—'}
                  </span>
                </div>
              </div>

              {/* Secondary Position */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-teal-300">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Secondary</span>
                  <span className="text-xs font-black text-white mt-0.5 block">
                    {secondaryPos || 'None'}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Match & Performance Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Matches:</span>
                <span className="font-black text-white stat-number">{totalMatches}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Goals:</span>
                <span className="font-black text-emerald-400 stat-number">{totalGoals}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Assists:</span>
                <span className="font-black text-teal-400 stat-number">{totalAssists}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                <span className="text-amber-300 uppercase text-[10px] font-black">GPI Rating:</span>
                <span className="font-black text-amber-300 stat-number">
                  {g?.gpi ? Number(g.gpi).toFixed(1) : g?.value || '84.0'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>


      {/* Main Grid: 4 Pillars of Football Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Player Attributes & System GPI */}
        <div className="space-y-6">
          
          {/* Pillar 1: Player Declared Information */}
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#071622] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <User className="w-4 h-4 mr-2 text-teal-500" /> Player Registration Data
              </span>
              <StatusBadge status="INFO" label="Declared" />
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Birth</span>
                  <span className="font-bold text-slate-900 dark:text-white stat-number">{p.dateOfBirth || p.age || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Preferred Foot</span>
                  <span className="font-bold text-slate-900 dark:text-white">{p.preferredFoot || 'Right'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Secondary Position</span>
                  <span className="font-bold text-slate-900 dark:text-white">{p.secondaryPosition || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Affiliation</span>
                  <span className="font-bold text-slate-900 dark:text-white">{p.teamAcademy || 'Independent'}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">Biography</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {p.biography || p.bio || 'No personal statement provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Pillar 2: System Calculated GPI Matrix */}
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#071622] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-emerald-500" /> Analytical Radar & GPI
              </span>
              <StatusBadge status="ACCEPTED" label="System" />
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-center -my-2">
                <SVGRadarChart stats={radarStats} size={220} color="#10b981" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {radarStats.map((stat) => (
                  <div key={stat.label} className="bg-slate-50 dark:bg-[#071622] rounded-lg py-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">{stat.label}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white stat-number">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Data Confidence</span>
                  <StatusBadge status="INFO" label={g?.dataConfidence || g?.confidence || 'MEDIUM'} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Quantitative Match Weight</span>
                  <span className="font-bold text-slate-900 dark:text-white stat-number">{Math.round(g?.quantitativeScore || 78)}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Verified Matches & Scout Field Observations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pillar 3: Organizer-Verified Official Matches */}
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#071622] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Verified Competition Match Log
              </span>
              <span className="text-xs font-bold text-slate-400 stat-number">{s.length} Fixtures</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <thead className="bg-slate-50 dark:bg-[#071622] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3 text-left">Fixture Match</th>
                    <th className="px-4 py-3 text-center">Minutes</th>
                    <th className="px-4 py-3 text-center">Goals</th>
                    <th className="px-4 py-3 text-center">Assists</th>
                    <th className="px-4 py-3 text-center">Discipline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {s.length > 0 ? s.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {m.matchDescription || m.title || `Fixture #${m.matchId || idx + 1}`}
                      </td>
                      <td className="px-4 py-3 text-center stat-number text-slate-600 dark:text-slate-300">{m.minutesPlayed ?? m.minutes ?? '-'}′</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400 stat-number">{m.goals || 0}</td>
                      <td className="px-4 py-3 text-center font-bold text-teal-600 dark:text-teal-400 stat-number">{m.assists || 0}</td>
                      <td className="px-4 py-3 text-center">
                        {(m.yellowCards > 0 || m.redCards > 0) ? (
                          <div className="flex justify-center space-x-1">
                            {m.yellowCards > 0 && <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm inline-block" />}
                            {m.redCards > 0 && <span className="w-2.5 h-3.5 bg-rose-500 rounded-sm inline-block" />}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        No verified tournament match records on file yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pillar 4: Scout Field Observations */}
          <div className="bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#071622] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                <ClipboardList className="w-4 h-4 mr-2 text-teal-500" /> Scout Field Observations
              </span>
              <StatusBadge status="INFO" label="Tactical Review" />
            </div>

            <div className="p-5 space-y-6">
              
              {/* Submission Form */}
              <form onSubmit={handleObsSubmit} className="bg-slate-50 dark:bg-[#071622] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center">
                  <Edit className="w-3.5 h-3.5 mr-1.5 text-teal-500" /> Log Field Observation (1–5 Matrix)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Technical', key: 'tech' },
                    { label: 'Tactical', key: 'tact' },
                    { label: 'Physical', key: 'phys' },
                    { label: 'Mental', key: 'psych' }
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                      <select 
                        value={obsForm[key]} 
                        onChange={(e) => setObsForm({ ...obsForm, [key]: Number(e.target.value) })}
                        className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white p-2"
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tactical Assessment Comments
                  </label>
                  <textarea 
                    rows={3} 
                    value={obsForm.comments} 
                    onChange={(e) => setObsForm({ ...obsForm, comments: e.target.value })} 
                    required 
                    placeholder="Provide specific notes on decision-making, speed of thought, aerial duels, weak foot..."
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white p-2.5 placeholder-slate-400"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={submittingObs} icon={<Send className="w-3.5 h-3.5 mr-1" />}>
                    {submittingObs ? 'Submitting...' : 'Submit Observation'}
                  </Button>
                </div>
              </form>

              {/* Observation Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged Field Reports</h4>
                {data.observations.length > 0 ? (
                  data.observations.map((obs, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#071622]/50 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{obs.scoutName || 'Licensed Scout'}</span>
                        <span className="text-[10px] text-slate-400">{obs.createdAt ? new Date(obs.createdAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">Tech: {obs.tech}/5</span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">Tact: {obs.tact}/5</span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">Phys: {obs.phys}/5</span>
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">Psych: {obs.psych}/5</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{obs.comments}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No field observations recorded for this prospect yet.</p>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
