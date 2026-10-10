import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Edit2, Save, X, User, Activity, 
  Shield, Trophy, Upload, Sparkles, RefreshCw, 
  Shirt, Ruler, Scale, Globe, Footprints, Palette
} from 'lucide-react';
import { playerService, getErrorMessage } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, FormInput, StatusBadge, PitchMarkings } from '../../components/common';
import SVGRadarChart from '../../components/auth/SVGRadarChart';
import { 
  getClubTheme, PRESET_CLUBS, ClubCrest, ClubWatermark, PlayerSilhouette, 
  getStoredClubBadge, saveStoredClubBadge, 
  getStoredPlayerPhysicals, saveStoredPlayerPhysicals, calculateAge,
  getStoredVisualSizes, saveStoredVisualSizes
} from '../../utils/clubTheme';
import { removePlayerPhotoBackground, fileToDataUrl } from '../../utils/backgroundRemoval';
import { getCardDesign } from '../../utils/cardDesigns';
import useCountUp from '../../hooks/useCountUp';

const AnimatedStat = ({ value, decimals = 0, duration = 800 }) => {
  const animated = useCountUp(value, duration, decimals);
  return <span className="stat-number">{animated}</span>;
};

const POSITION_OPTIONS = [
  { value: 'ST', label: 'Striker (ST)' },
  { value: 'CF', label: 'Centre Forward (CF)' },
  { value: 'LW', label: 'Left Wing (LW)' },
  { value: 'RW', label: 'Right Wing (RW)' },
  { value: 'AM', label: 'Attacking Midfield (AM)' },
  { value: 'CM', label: 'Central Midfield (CM)' },
  { value: 'DM', label: 'Defensive Midfield (DM)' },
  { value: 'LM', label: 'Left Midfield (LM)' },
  { value: 'RM', label: 'Right Midfield (RM)' },
  { value: 'LB', label: 'Left Back (LB)' },
  { value: 'RB', label: 'Right Back (RB)' },
  { value: 'CB', label: 'Center Back (CB)' },
  { value: 'GK', label: 'Goalkeeper (GK)' }
];

const PlayerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [extras, setExtras] = useState({ gpi: null, overallRank: null, totals: null });

  // Physical Attributes (Jersey number, Height, Weight, Country)
  const [physicals, setPhysicals] = useState({
    jerseyNumber: '',
    height: '',
    weight: '',
    country: ''
  });

  // Custom Club Badge & Cutout State
  const [customBadgeUrl, setCustomBadgeUrl] = useState(null);
  const [bgRemovalProgress, setBgRemovalProgress] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Visual Scale Sizes: Player Cutout & Club Crest (in percentage, 50% - 150%)
  const [visualSizes, setVisualSizes] = useState({
    playerSize: 100,
    crestSize: 100
  });

  const fileInputRef = useRef(null);
  const badgeInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await playerService.getProfile();
      setProfile(res.data);
      setFormData(res.data);
      setError(null);

      // Load stored custom club badge & physicals
      const profileKey = res.data?.id || res.data?.userId || 'current';
      const storedBadge = getStoredClubBadge(profileKey);
      if (storedBadge) setCustomBadgeUrl(storedBadge);

      const storedPhys = getStoredPlayerPhysicals(profileKey);
      setPhysicals({
        jerseyNumber: storedPhys.jerseyNumber || '',
        height: storedPhys.height || '',
        weight: storedPhys.weight || '',
        country: storedPhys.country || res.data?.location || ''
      });

      const storedSizes = getStoredVisualSizes(profileKey);
      setVisualSizes({
        playerSize: storedSizes.playerSize || 100,
        crestSize: storedSizes.crestSize || 100
      });

      const [gpiRes, rankRes, perfRes] = await Promise.all([
        playerService.getGPI().catch(() => null),
        playerService.getRanking().catch(() => null),
        playerService.getPerformance().catch(() => null)
      ]);
      const history = Array.isArray(perfRes?.data) ? perfRes.data : [];
      const overall = Array.isArray(rankRes?.data) ? rankRes.data.find((r) => r.context === 'OVERALL') : null;
      setExtras({
        gpi: gpiRes?.data || null,
        overallRank: overall?.rankValue ?? null,
        totals: {
          matches: history.reduce((n, h) => n + (h.totalMatches || 0), 0),
          goals: history.reduce((n, h) => n + (h.totalGoals || 0), 0),
          assists: history.reduce((n, h) => n + (h.totalAssists || 0), 0),
          yellowCards: history.reduce((n, h) => n + (h.yellowCards || 0), 0),
          redCards: history.reduce((n, h) => n + (h.redCards || 0), 0)
        }
      });
    } catch (err) {
      const status = err?.response?.status;
      setError(getErrorMessage(err, 'Failed to load profile.'));
      if (status === 404) setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setFormData(profile);
    const profileKey = profile?.id || profile?.userId || 'current';
    const storedPhys = getStoredPlayerPhysicals(profileKey);
    setPhysicals({
      jerseyNumber: storedPhys.jerseyNumber || '',
      height: storedPhys.height || '',
      weight: storedPhys.weight || '',
      country: storedPhys.country || profile?.location || ''
    });
    const storedSizes = getStoredVisualSizes(profileKey);
    setVisualSizes({
      playerSize: storedSizes.playerSize || 100,
      crestSize: storedSizes.crestSize || 100
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setBgRemovalProgress(null);
    setIsRemovingBg(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhysicalChange = (e) => {
    setPhysicals({ ...physicals, [e.target.name]: e.target.value });
  };

  const handleClubSelect = (clubName) => {
    setFormData(prev => ({ ...prev, teamAcademy: clubName }));
  };

  // Automatic Background Removal on Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRemovingBg(true);
      setBgRemovalProgress(15);
      const result = await removePlayerPhotoBackground(file, (pct) => {
        setBgRemovalProgress(Math.max(15, pct));
      });
      setFormData(prev => ({ ...prev, photoUrl: result.dataUrl }));
      setSuccess(result.success ? 'Player cutout created successfully!' : 'Photo loaded (original backdrop preserved).');
    } catch (err) {
      console.warn('Background removal failed, falling back to raw image:', err);
      const fallbackUrl = await fileToDataUrl(file);
      setFormData(prev => ({ ...prev, photoUrl: fallbackUrl }));
    } finally {
      setIsRemovingBg(false);
      setBgRemovalProgress(null);
    }
  };

  const handleCutoutCurrentPhoto = async () => {
    if (!formData.photoUrl || isRemovingBg) return;
    try {
      setIsRemovingBg(true);
      setBgRemovalProgress(20);
      const result = await removePlayerPhotoBackground(formData.photoUrl, (pct) => {
        setBgRemovalProgress(Math.max(20, pct));
      });
      if (result.dataUrl) {
        setFormData(prev => ({ ...prev, photoUrl: result.dataUrl }));
        setSuccess('Player cutout updated successfully!');
      }
    } catch (err) {
      setError('Could not process cutout for this image URL.');
    } finally {
      setIsRemovingBg(false);
      setBgRemovalProgress(null);
    }
  };

  const handleBadgeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setCustomBadgeUrl(dataUrl);
      const profileKey = profile?.id || profile?.userId || 'current';
      saveStoredClubBadge(profileKey, dataUrl);
    } catch (err) {
      setError('Failed to upload club badge.');
    }
  };

  const handleResetBadge = () => {
    setCustomBadgeUrl(null);
    const profileKey = profile?.id || profile?.userId || 'current';
    saveStoredClubBadge(profileKey, null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Save physical attributes & visual sizes to localStorage
      const profileKey = profile?.id || profile?.userId || 'current';
      saveStoredPlayerPhysicals(profileKey, physicals);
      saveStoredVisualSizes(profileKey, visualSizes);

      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth || null,
        location: physicals.country || formData.location,
        preferredFoot: formData.preferredFoot,
        primaryPosition: formData.primaryPosition,
        secondaryPosition: formData.secondaryPosition,
        teamAcademy: formData.teamAcademy,
        photoUrl: formData.photoUrl,
        biography: formData.biography,
        visibility: formData.visibility
      };
      const res = await playerService.updateProfile(payload);
      setProfile(res.data);
      setFormData(res.data);
      setSuccess('Player dossier updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Loading player dossier..." /></div>;
  if (!profile) return <div className="p-4"><Alert type="error" message={error || 'Profile not found.'} /></div>;

  const currentClubName = (isEditing ? formData.teamAcademy : profile.teamAcademy) || 'Free Agent';
  const clubTheme = getClubTheme(currentClubName);

  // Derive card theme and authentic backend attributes
  const chosenDesignName = profile?.card?.design || profile?.cardDesign || 'Bronze';
  const cardConfig = getCardDesign(chosenDesignName);

  const pacVal = profile?.curPac ?? extras.gpi?.attributes?.PAC ?? extras.gpi?.pace ?? profile?.pace ?? 75;
  const shoVal = profile?.curSho ?? extras.gpi?.attributes?.SHO ?? extras.gpi?.shooting ?? profile?.shooting ?? 70;
  const pasVal = profile?.curPas ?? extras.gpi?.attributes?.PAS ?? extras.gpi?.passing ?? profile?.passing ?? 72;
  const driVal = profile?.curDri ?? extras.gpi?.attributes?.DRI ?? extras.gpi?.dribbling ?? profile?.dribbling ?? 74;
  const defVal = profile?.curDef ?? extras.gpi?.attributes?.DEF ?? extras.gpi?.defense ?? profile?.defense ?? 65;
  const phyVal = profile?.curPhy ?? extras.gpi?.attributes?.PHY ?? extras.gpi?.physical ?? profile?.physical ?? 70;

  const radarStats = [
    { label: 'PAC', value: pacVal },
    { label: 'SHO', value: shoVal },
    { label: 'PAS', value: pasVal },
    { label: 'DRI', value: driVal },
    { label: 'DEF', value: defVal },
    { label: 'PHY', value: phyVal }
  ];

  const displayGpi = profile?.currentGpi != null
    ? Number(profile.currentGpi).toFixed(1)
    : extras.gpi?.gpi != null
      ? Number(extras.gpi.gpi).toFixed(1)
      : '0.0';

  const primaryPos = formData.primaryPosition || profile.primaryPosition || 'FWD';
  const secondaryPos = formData.secondaryPosition || profile.secondaryPosition;
  const playerPhoto = formData.photoUrl || profile.photoUrl;
  const age = calculateAge(formData.dateOfBirth || profile.dateOfBirth);

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* ======================================================== */}
      {/* 1. PROFESSIONAL PLAYER-CARD PROFILE BANNER */}
      {/* ======================================================== */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${clubTheme.border} shadow-2xl bg-gradient-to-br ${clubTheme.bgGradient} text-white transition-all duration-700 stagger-1`}>
        
        {/* Subtle Pitch Markings in the Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <PitchMarkings />
        </div>

        {/* Large Visible Club Crest Watermark Behind Player (with Scale Adjustment) */}
        <ClubWatermark 
          club={clubTheme} 
          customBadgeUrl={customBadgeUrl} 
          className="w-72 h-72 sm:w-96 sm:h-96 -left-10 sm:left-4 -top-8 sm:-top-10 opacity-40 dark:opacity-40 sm:opacity-45 origin-center transition-transform duration-200" 
          style={{
            transform: `scale(${((visualSizes?.crestSize || 100) / 100)})`,
          }}
        />

        {/* Dynamic Stadium Floodlight Overhead Canopy */}
        <div className="absolute top-0 inset-x-0 h-48 stadium-glow opacity-60 pointer-events-none" />

        {/* Subtle Club Accent Light Glow */}
        <div 
          className="absolute -top-20 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none" 
          style={{ backgroundColor: clubTheme.accent }}
        />

        {/* Top Header Bar: Club Identity & Action Controls */}
        <div className="relative z-10 px-6 pt-5 pb-2 flex items-center justify-between">
          
          {/* Club Identity Pill */}
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button 
                onClick={handleEdit} 
                variant="primary" 
                size="sm"
                className="shadow-lg"
                icon={Edit2}
              >
                Edit Dossier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={handleCancel} disabled={saving || isRemovingBg}>
                  Cancel
                </Button>
                <Button type="button" size="sm" variant="primary" onClick={handleSave} disabled={saving || isRemovingBg}>
                  {saving ? 'Saving...' : 'Save Dossier'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Showcase Body: Player Cutout + Compact Info Layout */}
        <div className="relative z-10 px-6 pt-2 pb-5 flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-8">
          
          {/* LEFT: Unconstrained Transparent Player Cutout (with Scale Adjustment) */}
          <div className="relative flex items-end justify-center flex-shrink-0 w-44 sm:w-52 lg:w-60 h-60 sm:h-72 lg:h-80 -mb-2 group select-none">
            
            <div 
              className="w-full h-full flex items-end justify-center origin-bottom transition-transform duration-200"
              style={{
                transform: `scale(${((visualSizes?.playerSize || 100) / 100)})`,
              }}
            >
              {playerPhoto ? (
                <img 
                  src={playerPhoto} 
                  alt={formData.fullName || 'Player Cutout'} 
                  className="h-full w-full object-contain object-bottom filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <div className="h-full w-full flex items-end justify-center pb-2">
                  <PlayerSilhouette className="h-full w-48 text-emerald-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" />
                </div>
              )}
            </div>

            {/* In-banner Edit Camera Trigger */}
            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2 right-2 p-2.5 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer"
                title="Upload portrait photo (auto background cutout)"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* Cutout Processing Indicator */}
            {isRemovingBg && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center p-3 z-30 backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider text-center">
                  Extracting Cutout... {bgRemovalProgress ? `${bgRemovalProgress}%` : ''}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Compact Player-Card Dossier Details */}
          <div className="flex-1 w-full space-y-3 text-center md:text-left">
            
            {/* Player Name & Primary Badge */}
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  {formData.fullName || profile.fullName || 'Prospect Dossier'}
                </h1>

                {extras.overallRank && (
                  <span className="inline-flex items-center text-xs font-black bg-amber-500/25 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full shadow-sm">
                    <Trophy className="w-3 h-3 mr-1 text-amber-400" /> Rank #<AnimatedStat value={extras.overallRank} />
                  </span>
                )}
              </div>

              {/* Subtitle Ribbon: Club • Age • Country • Primary Position • Shirt # */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-300 font-semibold mt-1">
                <span className="text-white font-bold">{clubTheme.name}</span>
                <span>•</span>
                <span>{age ? `${age} years old` : 'Age Unset'}</span>
                <span>•</span>
                <span>{physicals.country || formData.location || 'Location Unset'}</span>
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

            {/* Compact Player Information Grid (Inspired by Reference Player Card) */}
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
                    {formData.preferredFoot || 'Right'}
                  </span>
                </div>
              </div>

              {/* Country / Region */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-sky-300">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Country</span>
                  <span className="text-xs font-black text-white truncate max-w-[90px] mt-0.5 block">
                    {physicals.country || formData.location || '—'}
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

            {/* Bottom Integrated Match & GPI Performance Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Matches:</span>
                <span className="font-black text-white stat-number">
                  <AnimatedStat value={extras.totals?.matches ?? 0} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Goals:</span>
                <span className="font-black text-emerald-400 stat-number">
                  <AnimatedStat value={extras.totals?.goals ?? 0} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Assists:</span>
                <span className="font-black text-teal-400 stat-number">
                  <AnimatedStat value={extras.totals?.assists ?? 0} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                <span className="text-amber-300 uppercase text-[10px] font-black">GPI:</span>
                <span className="font-black text-amber-300 stat-number">
                  <AnimatedStat value={displayGpi} decimals={1} />
                </span>
              </div>
              <span>•</span>
              {/* Disciplinary Yellow & Red Cards with smooth hover micro-interactions */}
              <div 
                className="group/card flex items-center space-x-1.5 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-0.5 rounded-lg border border-amber-400/40 hover:border-amber-400 cursor-pointer transition-all duration-300 hover:scale-105 select-none"
                title={`${extras.totals?.yellowCards ?? 0} Yellow Cards logged`}
              >
                <div className="w-2.5 h-3.5 rounded-[2px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] border border-amber-500 flex-shrink-0 group-hover/card:rotate-6 transition-transform" />
                <span className="text-amber-300 uppercase text-[10px] font-bold">Yellow:</span>
                <span className="font-black text-amber-300 stat-number">
                  <AnimatedStat value={extras.totals?.yellowCards ?? 0} />
                </span>
              </div>
              <div 
                className="group/card flex items-center space-x-1.5 bg-rose-500/15 hover:bg-rose-500/25 px-2.5 py-0.5 rounded-lg border border-rose-500/40 hover:border-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 select-none"
                title={`${extras.totals?.redCards ?? 0} Red Cards logged`}
              >
                <div className="w-2.5 h-3.5 rounded-[2px] bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] border border-rose-600 flex-shrink-0 group-hover/card:rotate-6 transition-transform" />
                <span className="text-rose-300 uppercase text-[10px] font-bold">Red:</span>
                <span className="font-black text-rose-300 stat-number">
                  <AnimatedStat value={extras.totals?.redCards ?? 0} />
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Hidden File Inputs */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoUpload} 
      />
      <input 
        ref={badgeInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleBadgeUpload} 
      />

      {/* ======================================================== */}
      {/* 2. MAIN DOSSIER GRID: EDIT FORM & AUTHENTIC GPI CARD */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-2">
        
        {/* Left 2 Columns: Dossier Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* EDIT PHOTO & CUTOUT STUDIO (Visible while editing) */}
            {isEditing && (
              <Card 
                title="Player Portrait & Cutout Studio" 
                subtitle="Upload portrait photo — client AI automatically removes the background into a clean cutout"
                icon={Camera}
              >
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-[#071622] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-24 rounded-xl bg-slate-900 border-2 border-emerald-500 overflow-hidden flex items-end justify-center flex-shrink-0">
                      {formData.photoUrl ? (
                        <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-contain object-bottom" />
                      ) : (
                        <PlayerSilhouette className="w-16 h-20 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Player Cutout Treatment
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload any regular photo. The client AI isolates your player silhouette and renders it directly onto the club banner without rectangular boxes.
                      </p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="primary"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isRemovingBg}
                          icon={Upload}
                        >
                          {isRemovingBg ? 'Processing Cutout...' : 'Upload & Auto-Cutout'}
                        </Button>

                        {formData.photoUrl && (
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="secondary"
                            onClick={handleCutoutCurrentPhoto}
                            disabled={isRemovingBg}
                            icon={Sparkles}
                          >
                            Re-Extract Cutout
                          </Button>
                        )}

                        {formData.photoUrl && (
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))}
                            disabled={isRemovingBg}
                          >
                            Reset to Silhouette
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormInput 
                    label="Or Enter Direct Photo URL" 
                    name="photoUrl" 
                    placeholder="https://images.example.com/player-cutout.png"
                    value={formData.photoUrl || ''} 
                    onChange={handleChange} 
                  />

                  {/* Player Cutout Size / Scale Adjuster */}
                  <div className="bg-slate-50 dark:bg-[#071622] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Player Cutout Size</span>
                      </label>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 stat-number">
                        {visualSizes.playerSize}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">50%</span>
                      <input 
                        type="range"
                        min="50"
                        max="150"
                        step="2"
                        value={visualSizes.playerSize}
                        onChange={(e) => setVisualSizes(prev => ({ ...prev, playerSize: Number(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-[10px] font-bold text-slate-400">150%</span>
                      <button
                        type="button"
                        onClick={() => setVisualSizes(prev => ({ ...prev, playerSize: 100 }))}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-500 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Reset to 100%"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Live preview updates instantly in the club banner above.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* PLAYER PHYSICAL SPECIFICATIONS (Jersey #, Height, Weight, Country) */}
            <Card 
              title="Player Specifications & Combine Data" 
              subtitle="Jersey number, physical measurements, and country identity"
              icon={Ruler}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Jersey / Shirt #
                  </label>
                  <input
                    type="number"
                    name="jerseyNumber"
                    min="1"
                    max="99"
                    placeholder="e.g. 7"
                    value={physicals.jerseyNumber}
                    onChange={handlePhysicalChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    placeholder="e.g. 185"
                    value={physicals.height}
                    onChange={handlePhysicalChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="e.g. 80"
                    value={physicals.weight}
                    onChange={handlePhysicalChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Country / Federation
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="e.g. England, India"
                    value={physicals.country}
                    onChange={handlePhysicalChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>
              </div>
            </Card>

            {/* CLUB AFFILIATION & BADGE STUDIO */}
            <Card 
              title="Club & Academy Affiliation" 
              subtitle="Premier club theme, colors, and official crest watermark"
              icon={Shield}
            >
              <div className="space-y-4">
                {/* Active Club Preview */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071622] border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <ClubCrest club={clubTheme} customBadgeUrl={customBadgeUrl} className="w-10 h-10" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {clubTheme.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {clubTheme.type}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="secondary"
                        onClick={() => badgeInputRef.current?.click()}
                        icon={Upload}
                      >
                        Custom Crest
                      </Button>
                      {customBadgeUrl && (
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost"
                          onClick={handleResetBadge}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Preset Club Quick Selector (Edit mode) */}
                {isEditing && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                      Select Premier Club / Academy
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_CLUBS.map((c) => {
                        const isSelected = (formData.teamAcademy || '').toLowerCase() === c.name.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleClubSelect(c.name)}
                            className={`flex items-center space-x-2 p-2 rounded-xl text-left border text-xs font-bold transition-all ${
                              isSelected 
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'bg-slate-50 dark:bg-[#071622] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                            }`}
                          >
                            <ClubCrest club={c} className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <FormInput 
                  label="Team / Academy Name" 
                  name="teamAcademy" 
                  value={formData.teamAcademy || ''} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="e.g. Manchester United, Manchester City, Local High School..."
                />

                {/* Club Crest Size / Scale Adjuster (Edit Mode) */}
                {isEditing && (
                  <div className="bg-slate-50 dark:bg-[#071622] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Club Crest Watermark Size</span>
                      </label>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 stat-number">
                        {visualSizes.crestSize}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400">50%</span>
                      <input 
                        type="range"
                        min="50"
                        max="150"
                        step="2"
                        value={visualSizes.crestSize}
                        onChange={(e) => setVisualSizes(prev => ({ ...prev, crestSize: Number(e.target.value) }))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-[10px] font-bold text-slate-400">150%</span>
                      <button
                        type="button"
                        onClick={() => setVisualSizes(prev => ({ ...prev, crestSize: 100 }))}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-500 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Reset to 100%"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Scales the club crest watermark rendered across the header banner in real-time.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* TACTICAL POSITIONS */}
            <Card 
              title="Tactical Position & Footedness" 
              subtitle="Primary/secondary positions and preferred foot"
              icon={Activity}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Primary Position */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Primary Position
                  </label>
                  <select 
                    name="primaryPosition" 
                    value={formData.primaryPosition || ''} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <option value="">Select Primary Position...</option>
                    {POSITION_OPTIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>

                {/* Secondary Position */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Secondary Position
                  </label>
                  <select 
                    name="secondaryPosition" 
                    value={formData.secondaryPosition || ''} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <option value="">None / Unset</option>
                    {POSITION_OPTIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>{pos.label}</option>
                    ))}
                  </select>
                </div>

                {/* Preferred Foot */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Foot
                  </label>
                  <select 
                    name="preferredFoot" 
                    value={formData.preferredFoot || ''} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <option value="">Select Foot...</option>
                    <option value="RIGHT">Right Foot</option>
                    <option value="LEFT">Left Foot</option>
                    <option value="BOTH">Both Feet (Ambidextrous)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* PERSONAL REGISTRATION IDENTIFICATION */}
            <Card 
              title="Personal Information" 
              subtitle="Registration identity and official age context"
              icon={User}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput 
                  label="Full Name" 
                  name="fullName" 
                  value={formData.fullName || ''} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
                <FormInput 
                  label="Date of Birth" 
                  name="dateOfBirth" 
                  type="date" 
                  value={formData.dateOfBirth || ''} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
            </Card>

            {/* SCOUTING BIOGRAPHY & VISIBILITY */}
            <Card 
              title="Scouting Dossier & Visibility" 
              subtitle="Scout feed exposure and tactical playing style narrative"
              icon={Shield}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Scouting Biography / Playing Style
                  </label>
                  <textarea 
                    name="biography" 
                    rows={4} 
                    value={formData.biography || ''} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    placeholder="Describe your positional awareness, key strengths, transition play, leadership, and athletic traits..."
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Scout Visibility
                  </label>
                  <select 
                    name="visibility" 
                    value={formData.visibility || 'PUBLIC'} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                    className="mt-1 block w-full rounded-lg text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    <option value="PUBLIC">Public — Searchable by all verified scouts & coaches</option>
                    <option value="RESTRICTED">Restricted — Only tournament organizers & shortlisted scouts</option>
                    <option value="PRIVATE">Private — Invisible in public player directory</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Bottom Actions for Form */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving || isRemovingBg}>
                  <X className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving || isRemovingBg}>
                  {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-1.5" /> Save Changes</>}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Authentic GPI Player Card Showcase & Fixture Stats */}
        <div className="space-y-6">
          
          {/* Card Studio Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/player/card-studio')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Customize Card Style ({chosenDesignName})</span>
            </button>
          </div>

          {/* Authentic GPI Player Card Display */}
          <div 
            className="relative rounded-3xl p-5 shadow-2xl overflow-hidden card-elevate cursor-pointer group select-none"
            style={{
              background: cardConfig.gradient,
              border: `2px solid ${cardConfig.border}`,
              color: cardConfig.text
            }}
          >
            {/* Top Card Header */}
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div>
                <div 
                  className="text-3xl sm:text-4xl font-black tracking-tighter stat-number"
                  style={{ color: cardConfig.accent }}
                >
                  {displayGpi}
                </div>
                <div 
                  className="text-[11px] font-black uppercase tracking-widest"
                  style={{ color: cardConfig.accent }}
                >
                  {primaryPos}
                  {secondaryPos && <span className="opacity-70 font-normal"> / {secondaryPos}</span>}
                </div>
              </div>

              {/* Club Crest in Card Header */}
              <div className="flex items-center space-x-2 text-right">
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 block">{chosenDesignName.toUpperCase()} CARD</span>
                  <span className="text-[11px] font-bold truncate max-w-[120px] block" style={{ color: cardConfig.accent }}>
                    {clubTheme.name}
                  </span>
                </div>
                <ClubCrest club={clubTheme} customBadgeUrl={customBadgeUrl} className="w-7 h-7 flex-shrink-0" />
              </div>
            </div>

            {/* Player cutout in card */}
            <div 
              className="relative h-48 w-full rounded-2xl flex items-end justify-center overflow-hidden mb-3"
              style={{
                background: `linear-gradient(to top, ${cardConfig.badgeBg}, transparent)`,
                border: `1px solid ${cardConfig.border}`
              }}
            >
              {playerPhoto ? (
                <img src={playerPhoto} alt="Player" className="h-full w-full object-contain object-bottom" />
              ) : (
                <div className="w-full h-full flex items-end justify-center p-2">
                  <PlayerSilhouette className="w-32 h-40 opacity-80" />
                </div>
              )}
              
              <div 
                className="absolute bottom-2 inset-x-2 backdrop-blur-md py-1.5 px-3 rounded-xl text-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: `1px solid ${cardConfig.border}`
                }}
              >
                <span className="text-xs font-black uppercase tracking-wider text-white truncate block">
                  {formData.fullName || profile.fullName || 'Prospect Card'}
                </span>
              </div>
            </div>

            {/* Radar chart */}
            <div className="flex justify-center -my-2 relative z-10">
              <SVGRadarChart stats={radarStats} size={210} color={cardConfig.accent} />
            </div>

            {/* Stats PAC SHO PAS DRI DEF PHY */}
            <div 
              className="grid grid-cols-3 gap-2 text-center pt-3 text-xs relative z-10"
              style={{ borderTop: `1px solid ${cardConfig.border}` }}
            >
              {radarStats.map((stat) => (
                <div 
                  key={stat.label} 
                  className="rounded-xl py-1.5 transition-colors"
                  style={{ 
                    background: cardConfig.badgeBg,
                    border: `1px solid ${cardConfig.border}`
                  }}
                >
                  <span className="text-[10px] block font-bold opacity-80">{stat.label}</span>
                  <span className="font-black stat-number text-sm" style={{ color: cardConfig.accent }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Official Fixture Stats */}
          <Card 
            title="Verified Match Stats" 
            subtitle="Confirmed across sanctioned fixtures"
            icon={Shield}
          >
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-slate-50 dark:bg-[#071622] p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Matches</p>
                <p className="text-xl font-black text-slate-900 dark:text-white stat-number">
                  <AnimatedStat value={extras.totals?.matches ?? 0} />
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#071622] p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Goals</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 stat-number">
                  <AnimatedStat value={extras.totals?.goals ?? 0} />
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-[#071622] p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">Assists</p>
                <p className="text-xl font-black text-teal-600 dark:text-teal-400 stat-number">
                  <AnimatedStat value={extras.totals?.assists ?? 0} />
                </p>
              </div>
            </div>

            {/* Disciplinary Record Cards with Hover Tilt & Glow */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div 
                className="group p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 flex items-center justify-between transition-all duration-300 card-elevate-subtle cursor-pointer select-none"
                title="Total Yellow Cards across matches"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-6 rounded-[3px] bg-amber-400 shadow-sm border border-amber-500 group-hover:rotate-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Yellow</span>
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white stat-number">
                  <AnimatedStat value={extras.totals?.yellowCards ?? 0} />
                </span>
              </div>

              <div 
                className="group p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-400 flex items-center justify-between transition-all duration-300 card-elevate-subtle cursor-pointer select-none"
                title="Total Red Cards across matches"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-6 rounded-[3px] bg-rose-500 shadow-sm border border-rose-600 group-hover:rotate-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Red</span>
                </div>
                <span className="text-base font-black text-slate-900 dark:text-white stat-number">
                  <AnimatedStat value={extras.totals?.redCards ?? 0} />
                </span>
              </div>
            </div>
          </Card>

          {/* Engine Confidence Rating */}
          <Card 
            title="Scouting Analytics Confidence" 
            icon={Activity}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Data Reliability</span>
                <StatusBadge status="INFO" label={extras.gpi?.dataConfidence || 'MEDIUM'} />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Rank Standing</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {extras.overallRank ? `#${extras.overallRank} Overall` : 'Provisional'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Visibility Status</span>
                <StatusBadge status="ACCEPTED" label={formData.visibility || profile.visibility || 'PUBLIC'} />
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default PlayerProfile;
