import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scoutService } from '../../services/api';
import { 
  User, Shield, Award, MapPin, Calendar, Globe, Compass, 
  Edit2, Camera, RefreshCw, CheckCircle2, Bookmark, Eye, 
  Activity, Save, X, Sparkles, Building, Briefcase, FileText,
  Search, Check
} from 'lucide-react';
import { Button, Alert, LoadingSpinner, PitchMarkings } from '../../components/common';
import { 
  getClubTheme, ClubCrest, ClubWatermark, CoachSilhouette, 
  PRESET_COACHES, PRESET_CLUBS, 
  getStoredScoutDossier, saveStoredScoutDossier, 
  getStoredClubBadge, saveStoredClubBadge 
} from '../../utils/clubTheme';
import { removeBackground } from '../../utils/backgroundRemoval';
import useCountUp from '../../hooks/useCountUp';

const AnimatedStat = ({ value, decimals = 0, duration = 800 }) => {
  const animated = useCountUp(value, duration, decimals);
  return <span className="stat-number">{animated}</span>;
};

export default function ScoutProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const badgeInputRef = useRef(null);

  const scoutKey = user?.id || user?.userId || user?.username || 'current_scout';

  // Default Scout Dossier
  const defaultDossier = {
    name: user?.name || user?.username || 'Senior Scout',
    title: 'Chief Technical Scout & Recruiter',
    organization: 'Manchester City FC Academy',
    license: 'UEFA Pro License',
    territory: 'Global Elite & European U21s',
    specialization: 'Positional Play & Overloads',
    experience: '12 Seasons Pro Scouting',
    location: 'Manchester, England',
    photoUrl: '/assets/coaches/pep_guardiola.png',
    customBadgeUrl: null,
    bio: 'Dedicated football recruitment specialist focusing on positional intelligence, high-press sustainability, and elite passing vision. Oversees European prospect tracking and quantitative GPI data verification.',
    methodology: 'Tri-pillar scouting framework: 1. Video & spatial pattern audit, 2. Live in-stadium physical endurance check, 3. Algorithmic GPI performance validation.',
    preferredFormation: '4-3-3 Attacking Possession',
    recruitmentFocus: 'U17 - U23 Midfield & Wing Prospects'
  };

  const [dossier, setDossier] = useState(defaultDossier);
  const [formData, setFormData] = useState(defaultDossier);
  const [isEditing, setIsEditing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalProgress, setBgRemovalProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({ shortlistCount: 0, observationsCount: 0 });

  // Load Dossier from storage & API stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const stored = getStoredScoutDossier(scoutKey);
        const storedBadge = getStoredClubBadge(`scout_${scoutKey}`);

        const initial = stored ? { ...defaultDossier, ...stored } : defaultDossier;
        if (storedBadge) {
          initial.customBadgeUrl = storedBadge;
        }
        setDossier(initial);
        setFormData(initial);

        // Fetch shortlist & observations count to populate scouting strip
        try {
          const [shortlistRes, obsRes] = await Promise.all([
            scoutService.getShortlist().catch(() => ({ data: [] })),
            scoutService.getMyObservations ? scoutService.getMyObservations().catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
          ]);
          setStats({
            shortlistCount: Array.isArray(shortlistRes.data) ? shortlistRes.data.length : 0,
            observationsCount: Array.isArray(obsRes?.data) ? obsRes.data.length : 14
          });
        } catch (e) {
          setStats({ shortlistCount: 6, observationsCount: 14 });
        }
      } catch (err) {
        console.warn('Error loading scout dossier:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [scoutKey]);

  // Handle Preset Coach Persona Selection
  const applyPresetCoach = (preset) => {
    const updated = {
      ...formData,
      name: preset.name,
      title: preset.title,
      organization: preset.club,
      photoUrl: preset.photo,
      license: preset.license,
      territory: preset.territory,
      specialization: preset.specialization,
      experience: preset.experience,
      location: preset.location
    };
    setFormData(updated);
    if (!isEditing) {
      setDossier(updated);
      saveStoredScoutDossier(scoutKey, updated);
      setSuccess(`Applied ${preset.name} scout persona.`);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Photo Cutout Upload with Auto Background Removal
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }

    try {
      setIsRemovingBg(true);
      setError(null);
      setBgRemovalProgress('10%');

      const result = await removeBackground(file, (pct) => {
        setBgRemovalProgress(`${pct}%`);
      });

      const finalUrl = result.dataUrl;
      setFormData(prev => ({ ...prev, photoUrl: finalUrl }));
      if (!isEditing) {
        const updated = { ...dossier, photoUrl: finalUrl };
        setDossier(updated);
        saveStoredScoutDossier(scoutKey, updated);
      }
      setSuccess('Coach portrait extracted with transparent background!');
    } catch (err) {
      console.warn('AI Cutout failed, loading original photo:', err);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const originalUrl = loadEvent.target.result;
        setFormData(prev => ({ ...prev, photoUrl: originalUrl }));
        if (!isEditing) {
          const updated = { ...dossier, photoUrl: originalUrl };
          setDossier(updated);
          saveStoredScoutDossier(scoutKey, updated);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsRemovingBg(false);
      setBgRemovalProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Custom Club Badge Upload
  const handleBadgeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const badgeUrl = loadEvent.target.result;
      setFormData(prev => ({ ...prev, customBadgeUrl: badgeUrl }));
      saveStoredClubBadge(`scout_${scoutKey}`, badgeUrl);
      if (!isEditing) {
        setDossier(prev => ({ ...prev, customBadgeUrl: badgeUrl }));
      }
      setSuccess('Organization crest updated.');
    };
    reader.readAsDataURL(file);
    if (badgeInputRef.current) badgeInputRef.current.value = '';
  };

  const handleResetBadge = () => {
    setFormData(prev => ({ ...prev, customBadgeUrl: null }));
    setDossier(prev => ({ ...prev, customBadgeUrl: null }));
    saveStoredClubBadge(`scout_${scoutKey}`, null);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      saveStoredScoutDossier(scoutKey, formData);
      setDossier(formData);
      setIsEditing(false);
      setSuccess('Scout dossier successfully updated.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError('Failed to save scout dossier.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(dossier);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading scout dossier..." />
      </div>
    );
  }

  const currentOrg = (isEditing ? formData.organization : dossier.organization) || 'Manchester City';
  const clubTheme = getClubTheme(currentOrg);
  const activePhoto = isEditing ? formData.photoUrl : dossier.photoUrl;
  const activeBadge = isEditing ? formData.customBadgeUrl : dossier.customBadgeUrl;
  const activeData = isEditing ? formData : dossier;

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* ======================================================== */}
      {/* 1. PROFESSIONAL SCOUT / COACH DOSSIER BANNER */}
      {/* ======================================================== */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${clubTheme.border} shadow-2xl bg-gradient-to-br ${clubTheme.bgGradient} text-white transition-all duration-700`}>
        
        {/* Subtle Pitch Markings in the Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <PitchMarkings />
        </div>

        {/* Large Visible Organization Crest Watermark */}
        <ClubWatermark 
          club={clubTheme} 
          customBadgeUrl={activeBadge} 
          className="w-72 h-72 sm:w-96 sm:h-96 -left-10 sm:left-4 -top-8 sm:-top-10 opacity-40 dark:opacity-40 sm:opacity-45" 
        />

        {/* Dynamic Stadium Floodlight Overhead Canopy */}
        <div className="absolute top-0 inset-x-0 h-48 stadium-glow opacity-60 pointer-events-none" />

        {/* Dynamic Club Accent Light Glow */}
        <div 
          className="absolute -top-20 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none" 
          style={{ backgroundColor: clubTheme.accent }}
        />

        {/* Top Header Bar: Organization Identity & Action Controls */}
        <div className="relative z-10 px-6 pt-5 pb-2 flex items-center justify-between">
          
          {/* Organization Identity Pill */}
          <div className="flex items-center space-x-2.5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-sm">
            <ClubCrest club={clubTheme} customBadgeUrl={activeBadge} className="w-6 h-6" />
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
                onClick={() => setIsEditing(true)} 
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

        {/* Main Showcase Body: Coach Cutout + Compact Scout Info Layout */}
        <div 
          key={activeData.name || activeData.photoUrl} 
          className="relative z-10 px-6 pt-2 pb-5 flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-8 animate-persona-fade"
        >
          
          {/* LEFT: Unconstrained Transparent Coach Cutout */}
          <div className="relative flex items-end justify-center flex-shrink-0 w-44 sm:w-52 lg:w-60 h-60 sm:h-72 lg:h-80 -mb-2 group select-none">
            
            {activePhoto ? (
              <img 
                src={activePhoto} 
                alt={activeData.name || 'Coach Cutout'} 
                className="h-full w-full object-contain object-bottom filter drop-shadow-[0_16px_28px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="h-full w-full flex items-end justify-center pb-2">
                <CoachSilhouette className="h-full w-48 text-teal-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" />
              </div>
            )}

            {/* In-banner Photo Upload Trigger */}
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
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-2" />
                <span className="text-xs font-black text-teal-300 uppercase tracking-wider text-center">
                  Extracting Cutout... {bgRemovalProgress ? `${bgRemovalProgress}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Compact Scout Dossier Details */}
          <div className="flex-1 w-full space-y-3 text-center md:text-left">
            
            {/* Scout Name & Verification Badge */}
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  {activeData.name}
                </h1>

                <span className="inline-flex items-center text-xs font-black bg-teal-500/25 text-teal-300 border border-teal-500/50 px-2.5 py-0.5 rounded-full shadow-sm">
                  <Shield className="w-3 h-3 mr-1 text-teal-400" /> Certified Scout
                </span>
              </div>

              {/* Subtitle Ribbon: Title • Organization • Territory */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-300 font-semibold mt-1">
                <span className="text-amber-300 font-bold">{activeData.title}</span>
                <span>•</span>
                <span className="text-white font-bold">{clubTheme.name}</span>
                <span>•</span>
                <span>{activeData.location}</span>
                <span>•</span>
                <span className="text-teal-300 font-bold">{activeData.license}</span>
              </div>
            </div>

            {/* Compact 6-Pill Scout Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl bg-black/35 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
              
              {/* License Level */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-amber-300">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">License</span>
                  <span className="text-xs font-black text-white truncate max-w-[120px] mt-0.5 block">
                    {activeData.license}
                  </span>
                </div>
              </div>

              {/* Territory */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-teal-300">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Territory</span>
                  <span className="text-xs font-black text-white truncate max-w-[120px] mt-0.5 block">
                    {activeData.territory}
                  </span>
                </div>
              </div>

              {/* Tactical Specialization */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-emerald-300">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Tactical Spec</span>
                  <span className="text-xs font-black text-white truncate max-w-[120px] mt-0.5 block">
                    {activeData.specialization}
                  </span>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-sky-300">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Experience</span>
                  <span className="text-xs font-black text-white mt-0.5 block">
                    {activeData.experience}
                  </span>
                </div>
              </div>

              {/* Operational HQ / Location */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-rose-300">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Base HQ</span>
                  <span className="text-xs font-black text-white truncate max-w-[120px] mt-0.5 block">
                    {activeData.location}
                  </span>
                </div>
              </div>

              {/* Formation / Setup */}
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-white/10 text-indigo-300">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Formation</span>
                  <span className="text-xs font-black text-white truncate max-w-[120px] mt-0.5 block">
                    {activeData.preferredFormation || '4-3-3'}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Scouting Performance & Metrics Strip */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs">
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-400 uppercase text-[10px] font-bold">Shortlisted Prospects:</span>
                <span className="font-black text-white stat-number">
                  <AnimatedStat value={stats.shortlistCount} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 uppercase text-[10px] font-bold">Field Observations:</span>
                <span className="font-black text-emerald-400 stat-number">
                  <AnimatedStat value={stats.observationsCount} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-0.5 rounded-lg border border-teal-500/30">
                <CheckCircle2 className="w-3 h-3 text-teal-300" />
                <span className="text-teal-300 uppercase text-[10px] font-black">Scout Status:</span>
                <span className="font-black text-white">ACTIVE / LEVEL 5 PRO</span>
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
      {/* 2. LEGENDARY COACH / SCOUT PERSONA PRESETS BAR */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#071622] rounded-2xl p-4 border border-slate-200 dark:border-emerald-950/40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Quick Coach / Scout Personas
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click to preview professional coaching identities
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESET_COACHES.map(preset => {
            const isSelected = activeData.photoUrl === preset.photo;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPresetCoach(preset)}
                className={`relative flex items-center p-2.5 rounded-xl border text-left card-elevate hover:-translate-y-1 hover:shadow-md transition-all duration-200 ease-out ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 mr-2.5 border border-white/10">
                  <img src={preset.photo} alt={preset.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {preset.club}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. EDIT DOSSIER FORM (WHEN EDITING) */}
      {/* ======================================================== */}
      {isEditing && (
        <div className="bg-white dark:bg-[#071622] rounded-3xl p-6 border-2 border-teal-500/40 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-teal-500" /> Edit Scout Dossier & Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your organization identity, professional licenses, and tactical methodology.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>Save Changes</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Identity & Organization */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Identity & Club</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scout Full Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Title / Role</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Club / Organization</label>
                <select 
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {PRESET_CLUBS.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Photo & Badge Upload Buttons */}
              <div className="pt-2 space-y-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  icon={Camera}
                >
                  Upload Portrait (AI Cutout)
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 justify-center"
                    onClick={() => badgeInputRef.current?.click()}
                    icon={Building}
                  >
                    Upload Crest
                  </Button>
                  {formData.customBadgeUrl && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleResetBadge}
                    >
                      Reset Crest
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Licensing & Field Territory */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Licensing & Operations</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coaching / Scout License</label>
                <input 
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="e.g. UEFA Pro License, AFC Pro"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Territory Focus</label>
                <input 
                  type="text"
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  placeholder="e.g. Global Elite, European U21s, South America"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tactical Specialization</label>
                <input 
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Positional Play & Overloads, High Press"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <input 
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Base HQ</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Tactical Philosophy & Bio */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Tactics & Methodology</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Formation</label>
                <input 
                  type="text"
                  value={formData.preferredFormation}
                  onChange={(e) => setFormData({ ...formData, preferredFormation: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recruitment Focus</label>
                <input 
                  type="text"
                  value={formData.recruitmentFocus}
                  onChange={(e) => setFormData({ ...formData, recruitmentFocus: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scout Bio</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SCOUT METHODOLOGY & TACTICAL PHILOSOPHY CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Scouting Methodology & Tri-Pillar Framework */}
        <div className="bg-white dark:bg-[#071622] rounded-2xl p-5 border border-slate-200 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Scouting Methodology & Philosophy
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Framework applied to evaluate young athletic talent
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeData.bio}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Recruitment Framework
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              {activeData.methodology}
            </p>
          </div>
        </div>

        {/* Card 2: Tactical System & Target Archetypes */}
        <div className="bg-white dark:bg-[#071622] rounded-2xl p-5 border border-slate-200 dark:border-emerald-950/40 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Tactical System & Target Archetypes
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Squad alignment and profile priorities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Formation Anchor</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                {activeData.preferredFormation || '4-3-3 Attacking'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Window</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                {activeData.recruitmentFocus || 'U17 - U23 Prospects'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Core Athletic Traits Sought</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['High-Press Stamina', 'Under-Pressure Passing', 'First-Touch Velocity', 'Explosive Acceleration', 'Tactical IQ'].map((trait, i) => (
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
