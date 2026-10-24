import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { scoutService } from '../../services/api';
import { 
  Shield, Award, MapPin, Calendar, Globe, Compass, 
  Edit2, CheckCircle2, Bookmark, 
  Activity, Sparkles, Building, FileText,
  Check, Phone
} from 'lucide-react';
import { Button, Alert, LoadingSpinner, PitchMarkings } from '../../components/common';
import { 
  getClubTheme, ClubCrest, ClubWatermark, 
  PRESET_CLUBS, 
  getStoredScoutDossier, saveStoredScoutDossier, 
  getStoredClubBadge, saveStoredClubBadge 
} from '../../utils/clubTheme';
import useCountUp from '../../hooks/useCountUp';

const AnimatedStat = ({ value, decimals = 0, duration = 800 }) => {
  const animated = useCountUp(value, duration, decimals);
  return <span className="stat-number">{animated}</span>;
};

export default function ScoutProfile() {
  const { user } = useAuth();
  const badgeInputRef = useRef(null);

  const scoutKey = user?.id || user?.userId || user?.username || 'current_scout';

  // Default Scout Dossier
  const defaultDossier = {
    name: user?.name || user?.username || 'Senior Scout',
    title: 'Chief Technical Scout & Recruiter',
    organization: 'Manchester City FC Academy',
    phoneNumber: '',
    license: 'UEFA Pro License',
    territory: 'Global Elite & European U21s',
    specialization: 'Positional Play & Overloads',
    experience: '12 Seasons Pro Scouting',
    location: 'Manchester, England',
    customBadgeUrl: null,
    bio: 'Dedicated football recruitment specialist focusing on positional intelligence, high-press sustainability, and elite passing vision. Oversees European prospect tracking and quantitative GPI data verification.',
    methodology: 'Tri-pillar scouting framework: 1. Video & spatial pattern audit, 2. Live in-stadium physical endurance check, 3. Algorithmic GPI performance validation.',
    preferredFormation: '4-3-3 Attacking Possession',
    recruitmentFocus: 'U17 - U23 Midfield & Wing Prospects'
  };

  const [dossier, setDossier] = useState(defaultDossier);
  const [formData, setFormData] = useState(defaultDossier);
  const [isEditing, setIsEditing] = useState(false);
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

        let initial = stored ? { ...defaultDossier, ...stored } : defaultDossier;
        if (storedBadge) {
          initial.customBadgeUrl = storedBadge;
        }

        // Fetch backend scout profile to sync official mobile contact number and organization
        try {
          const apiProfileRes = await scoutService.getProfile();
          if (apiProfileRes?.data) {
            initial = {
              ...initial,
              phoneNumber: apiProfileRes.data.phoneNumber || initial.phoneNumber || '',
              organization: apiProfileRes.data.organization || initial.organization || ''
            };
          }
        } catch (apiErr) {
          console.warn('Backend scout profile not yet synced:', apiErr);
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

  const handleSave = async () => {
    // Validate phone number if entered
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const digitsOnly = formData.phoneNumber.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setError('Please enter a valid phone number (between 7 and 15 digits).');
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      // Save to backend database
      await scoutService.updateProfile({
        organization: formData.organization,
        affiliation: formData.specialization || formData.affiliation,
        phoneNumber: formData.phoneNumber
      });

      saveStoredScoutDossier(scoutKey, formData);
      setDossier(formData);
      setIsEditing(false);
      setSuccess('Scout dossier and contact details successfully saved.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save scout dossier.');
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
                <Button type="button" size="sm" variant="secondary" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button type="button" size="sm" variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Dossier'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Showcase Body: Scout Info Layout */}
        <div 
          key={activeData.name} 
          className="relative z-10 px-6 py-4 flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 animate-persona-fade"
        >
          {/* Scout Dossier Details */}
          <div className="flex-1 w-full space-y-4 text-center md:text-left">
            
            {/* Scout Name & Verification Badge */}
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
                  {activeData.name}
                </h1>

                <span className="inline-flex items-center text-xs font-black bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 px-2.5 py-0.5 rounded-full shadow-sm">
                  <Shield className="w-3 h-3 mr-1 text-cyan-400" /> Certified Scout
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
                <span className="text-cyan-300 font-bold">{activeData.license}</span>
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
                <div className="p-1.5 rounded-lg bg-white/10 text-cyan-300">
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
                <div className="p-1.5 rounded-lg bg-white/10 text-blue-300">
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
              <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 uppercase text-[10px] font-bold">Mobile Contact:</span>
                <span className="font-mono font-bold text-white">
                  {activeData.phoneNumber || <span className="text-amber-300 italic font-sans font-normal">Not saved (Required for contact requests)</span>}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400 uppercase text-[10px] font-bold">Shortlisted Prospects:</span>
                <span className="font-black text-white stat-number">
                  <AnimatedStat value={stats.shortlistCount} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400 uppercase text-[10px] font-bold">Field Observations:</span>
                <span className="font-black text-blue-400 stat-number">
                  <AnimatedStat value={stats.observationsCount} />
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                <CheckCircle2 className="w-3 h-3 text-cyan-300" />
                <span className="text-cyan-300 uppercase text-[10px] font-black">Scout Status:</span>
                <span className="font-black text-white">ACTIVE / LEVEL 5 PRO</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Hidden File Input for Club Crest */}
      <input 
        ref={badgeInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleBadgeUpload} 
      />

      {/* ======================================================== */}
      {/* 3. EDIT DOSSIER FORM (WHEN EDITING) */}
      {/* ======================================================== */}
      {isEditing && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-cyan-500/40 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center">
                <Edit2 className="w-4 h-4 mr-2 text-cyan-500" /> Edit Scout Dossier & Credentials
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Title / Role</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Club / Organization</label>
                <select 
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {PRESET_CLUBS.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              {/* Badge Upload Buttons */}
              <div className="pt-2 space-y-2">
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
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Contact & Operations</h4>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Contact Number <span className="text-cyan-500 font-normal">(Shared with players in contact requests)</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="tel"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. +44 7911 123456 or 9876543210"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Saved directly to your scout account. Used automatically when sending recruitment contact requests.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Coaching / Scout License</label>
                <input 
                  type="text"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="e.g. UEFA Pro License, AFC Pro"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Territory Focus</label>
                <input 
                  type="text"
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                  placeholder="e.g. Global Elite, European U21s, South America"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tactical Specialization</label>
                <input 
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Positional Play & Overloads, High Press"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Experience</label>
                  <input 
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Base HQ</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recruitment Focus</label>
                <input 
                  type="text"
                  value={formData.recruitmentFocus}
                  onChange={(e) => setFormData({ ...formData, recruitmentFocus: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scout Bio</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-blue-950/40 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-blue-950/40 shadow-sm space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
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
                  <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
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
