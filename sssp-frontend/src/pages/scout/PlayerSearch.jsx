import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Save, Users, Star, ArrowUpDown, MapPin, CheckCircle, Award, GitCompare, X } from 'lucide-react';
import { scoutService } from '../../services/api';
import { LoadingSpinner, Alert, Modal, Button, StatusBadge, EmptyState, ScoutTargetIcon, FootballIcon, PitchHero, ClassicSoccerBall, PitchMarkings } from '../../components/common';
import { 
  getClubTheme, ClubCrest, ClubWatermark, PlayerSilhouette, 
  getStoredClubBadge, calculateAge 
} from '../../utils/clubTheme';

const POSITIONS = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'LW', 'RW', 'ST'];
const AGE_GROUPS = ['U13', 'U15', 'U17', 'U19', 'U21', 'Open'];

export default function PlayerSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    query: initialQuery,
    positions: [],
    ageGroup: '',
    location: '',
    minGpi: '',
    maxGpi: '',
    minMatches: '',
    dataConfidence: '',
    team: '',
    sortBy: 'gpi',
    sortDir: 'desc'
  });

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = {
        ...filters,
        position: filters.positions.length ? filters.positions.join(',') : undefined,
      };
      const response = await scoutService.searchPlayers(searchParams);
      setResults(response.data || []);
    } catch (err) {
      setError('Failed to query player talent database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults();
  };

  const handleClear = () => {
    setFilters({
      query: '', positions: [], ageGroup: '', location: '',
      minGpi: '', maxGpi: '', minMatches: '', dataConfidence: '',
      team: '', sortBy: 'gpi', sortDir: 'desc'
    });
  };

  const handlePositionToggle = (pos) => {
    setFilters(prev => ({
      ...prev,
      positions: prev.positions.includes(pos) 
        ? prev.positions.filter(p => p !== pos)
        : [...prev.positions, pos]
    }));
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    try {
      await scoutService.saveFilter({ name: filterName, criteria: filters });
      setIsFilterModalOpen(false);
      setFilterName('');
    } catch (err) {
      setError('Failed to persist tactical filter.');
    }
  };

  const togglePlayerSelection = (id) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedPlayers.length > 1) {
      navigate(`/compare?ids=${selectedPlayers.join(',')}`);
    }
  };

  const handleAddToShortlist = async (playerId) => {
    try {
      await scoutService.addToShortlist(playerId);
      fetchResults();
    } catch (err) {
      setError('Failed to add prospect to shortlist.');
    }
  };

  const renderGPIBadge = (gpi) => {
    const val = Number(gpi || 0);
    let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    if (val >= 80) colorClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
    else if (val >= 65) colorClass = 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-500/40';
    else if (val >= 50) colorClass = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-500/40';

    return (
      <span className={`px-2 py-0.5 rounded-lg text-xs font-black border ${colorClass} stat-number`}>
        GPI {val ? val.toFixed(1) : 'N/A'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TALENT SCOUTING PITCH HERO */}
      <PitchHero
        title="Scouting Talent Directory"
        subtitle="Filter certified football prospects by tactical role, verified match logs, and quantitative GPI metrics"
        badgeText="TALENT DISCOVERY ENGINE • REGIONAL REGISTRY"
        stats={[
          { label: "FOUND", value: results.length },
          { label: "SELECTED", value: selectedPlayers.length },
          { label: "FILTER", value: filters.positions.length ? filters.positions.join('/') : "ALL POS" },
          { label: "CONFIDENCE", value: filters.dataConfidence || "ANY" }
        ]}
        actionButtons={
          selectedPlayers.length > 1 ? (
            <Button 
              variant="primary" 
              onClick={handleCompare}
              icon={<GitCompare className="w-4 h-4 mr-1" />}
            >
              Compare ({selectedPlayers.length}) Selected Prospects
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              onClick={() => navigate('/shortlist')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
            >
              View Active Shortlist
            </Button>
          )
        }
      />

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Tactical Filter Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-[#0b1e2d] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/30 space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center">
                <Filter className="w-4 h-4 mr-2 text-teal-500" /> Tactical Filters
              </h2>
              <button 
                onClick={handleClear} 
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Reset All
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Search Query
                </label>
                <input 
                  type="text" 
                  value={filters.query} 
                  onChange={e => setFilters({...filters, query: e.target.value})} 
                  placeholder="Player name, academy..." 
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Tactical Position
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {POSITIONS.map(pos => {
                    const active = filters.positions.includes(pos);
                    return (
                      <button 
                        type="button" 
                        key={pos} 
                        onClick={() => handlePositionToggle(pos)}
                        className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                          active 
                            ? 'bg-teal-600 border-teal-500 text-white shadow-sm' 
                            : 'bg-slate-50 dark:bg-[#081b29] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                        }`}
                      >
                        {pos}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Age Category
                </label>
                <select 
                  value={filters.ageGroup} 
                  onChange={e => setFilters({...filters, ageGroup: e.target.value})} 
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Any Age Group</option>
                  {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  GPI Rating Range
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="Min (e.g. 70)" 
                    value={filters.minGpi} 
                    onChange={e => setFilters({...filters, minGpi: e.target.value})} 
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400">—</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="Max (100)" 
                    value={filters.maxGpi} 
                    onChange={e => setFilters({...filters, maxGpi: e.target.value})} 
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Min Verified Matches
                </label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="e.g. 5"
                  value={filters.minMatches} 
                  onChange={e => setFilters({...filters, minMatches: e.target.value})} 
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Data Confidence
                </label>
                <select 
                  value={filters.dataConfidence} 
                  onChange={e => setFilters({...filters, dataConfidence: e.target.value})} 
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                >
                  <option value="">Any Confidence</option>
                  <option value="HIGH">High (10+ Matches)</option>
                  <option value="MEDIUM">Medium (5-9 Matches)</option>
                  <option value="LOW">Low (1-4 Matches)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" variant="primary" fullWidth className="bg-teal-600 hover:bg-teal-500 border-teal-500">
                  Apply Tactical Filters
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => setIsFilterModalOpen(true)}
                  icon={<Save className="w-4 h-4 mr-1.5" />}
                >
                  Save Preset
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Stream */}
        <div className="flex-1 space-y-4">
          {error && <Alert type="error" message={error} />}
          
          {/* Results Toolbar */}
          <div className="bg-white dark:bg-[#0b1e2d] px-5 py-3.5 rounded-xl shadow-sm border border-slate-200 dark:border-emerald-900/30 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center space-x-3 text-sm">
              <span className="font-bold text-slate-900 dark:text-white">{results.length} Prospects</span>
              {selectedPlayers.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-600 dark:text-teal-300 border border-teal-500/30">
                  {selectedPlayers.length} Selected for Compare
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Sort:</span>
              <select 
                value={filters.sortBy} 
                onChange={e => { setFilters({...filters, sortBy: e.target.value}); fetchResults(); }} 
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white px-2 py-1.5"
              >
                <option value="gpi">GPI Rating</option>
                <option value="recent_form">Recent Form</option>
                <option value="matches_played">Matches Logged</option>
              </select>
              <button 
                type="button" 
                onClick={() => { setFilters({...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc'}); fetchResults(); }} 
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-16"><LoadingSpinner size="lg" text="Searching scout directory..." /></div>
          ) : results.length === 0 ? (
            <EmptyState 
              title="No prospects found" 
              message="No athletes match the current combination of tactical parameters." 
              icon={<Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
              action={<Button variant="outline" onClick={handleClear}>Clear All Filters</Button>}
            />
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
              {results.map((player, idx) => {
                const playerId = player.playerId || player.id;
                const playerName = player.playerName || player.name || 'Athletic Prospect';
                const playerPos = player.primaryPosition || player.position || 'FWD';
                const playerTeam = player.teamAcademy || player.team || 'Free Agent';
                const playerLocation = player.location || 'Location Unspecified';
                const playerMatches = player.verifiedMatches ?? player.totalMatches ?? 0;
                const playerGpi = player.gpi != null ? Number(player.gpi) : null;
                const playerPhoto = player.photoUrl;
                const playerAge = player.age ? `${player.age} yrs` : (player.dateOfBirth ? `${calculateAge(player.dateOfBirth)} yrs` : null);
                const clubTheme = getClubTheme(playerTeam);
                const customBadgeUrl = getStoredClubBadge(playerId);
                const isSelected = selectedPlayers.includes(playerId);

                return (
                  <div 
                    key={playerId} 
                    style={{ animationDelay: `${Math.min(idx * 35, 240)}ms` }}
                    className={`group bg-white dark:bg-[#0b1e2d] rounded-3xl shadow-md border transition-all duration-300 ease-out overflow-hidden flex flex-col justify-between card-elevate hover:shadow-2xl hover:-translate-y-[5px] animate-page-in ${
                      isSelected 
                        ? 'border-teal-400 ring-2 ring-teal-400/30 shadow-teal-900/20' 
                        : 'border-slate-200 dark:border-emerald-900/30 hover:border-teal-500/50'
                    }`}
                  >
                    {/* AUTHENTIC MINI BANNER HEADER */}
                    <div 
                      onClick={() => navigate(`/players/${playerId}`)}
                      className={`relative h-44 cursor-pointer overflow-hidden rounded-t-3xl border-b border-white/10 bg-gradient-to-br ${clubTheme.bgGradient} p-4 text-white flex flex-col justify-between select-none transition-all duration-500 group-hover:brightness-105`}
                      title={`View ${playerName}'s Tactical Dossier`}
                    >
                      {/* Pitch Markings Overlay */}
                      <div className="absolute inset-0 opacity-15 pointer-events-none">
                        <PitchMarkings />
                      </div>

                      {/* Large Subtle Crest Watermark in Background */}
                      <div className="transition-transform duration-300 group-hover:scale-105">
                        <ClubWatermark 
                          club={clubTheme} 
                          customBadgeUrl={customBadgeUrl} 
                          className="w-48 h-48 -left-8 -top-8 opacity-30 group-hover:opacity-45 transition-opacity" 
                        />
                      </div>

                      {/* Stadium Overhead Floodlight Glow */}
                      <div className="absolute top-0 inset-x-0 h-24 stadium-glow opacity-50 pointer-events-none" />

                      {/* Dynamic Club Accent Light Glow */}
                      <div 
                        className="absolute -top-10 right-0 w-36 h-36 rounded-full blur-2xl opacity-25 pointer-events-none" 
                        style={{ backgroundColor: clubTheme.accent }}
                      />

                      {/* Top Bar: Checkbox + Club Badge Pill + GPI Pill */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Selection Checkbox */}
                          <label 
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center justify-center p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 hover:bg-black/60 transition-colors cursor-pointer"
                            title={isSelected ? "Deselect for comparison" : "Select for comparison"}
                          >
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => togglePlayerSelection(playerId)} 
                              className="w-4 h-4 rounded text-teal-500 border-white/40 focus:ring-teal-400 cursor-pointer"
                            />
                          </label>

                          {/* Club Badge Pill */}
                          <div className="flex items-center space-x-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 shadow-sm max-w-[155px]">
                            <ClubCrest club={clubTheme} customBadgeUrl={customBadgeUrl} className="w-4 h-4 flex-shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-white truncate">
                              {clubTheme.name}
                            </span>
                          </div>
                        </div>

                        {/* GPI Rating Pill */}
                        <div className="flex items-center space-x-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 shadow-sm">
                          <span className="text-[9px] uppercase font-black text-slate-400">GPI</span>
                          <span className="text-xs font-black text-amber-300 stat-number">
                            {playerGpi != null ? playerGpi.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Main Showcase Body: Cutout / Photo + Name + Position */}
                      <div className="relative z-10 flex items-end justify-between mt-auto pt-2">
                        {/* Player Cutout / Photo Standing on bottom left */}
                        <div className="relative w-24 h-28 flex items-end justify-center flex-shrink-0 -mb-4">
                          {playerPhoto ? (
                            <img 
                              src={playerPhoto} 
                              alt={playerName} 
                              className="h-full w-full object-contain object-bottom filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-end justify-center">
                              <PlayerSilhouette 
                                className="h-full w-20 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]" 
                                style={{ color: clubTheme.accent || '#34d399' }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Player Name & Info on right matching club color */}
                        <div className="flex-1 pl-3 pb-1 text-right">
                          <span className="inline-block px-2 py-0.5 mb-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/15 text-white">
                            {playerPos}
                          </span>
                          <h3 
                            className="font-black text-base sm:text-lg leading-tight truncate transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                            style={{ 
                              color: clubTheme.accent || '#ffffff',
                              textShadow: `0 0 12px ${clubTheme.accent}40`
                            }}
                          >
                            {playerName}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-300/90 truncate mt-0.5">
                            {playerAge ? `${playerAge} • ` : ''}{playerTeam}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CARD DETAILS BODY */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3 bg-slate-50 dark:bg-[#071622] rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Location</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 mr-1 text-teal-500 flex-shrink-0" />
                            <span className="truncate">{playerLocation}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Verified Matches</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 stat-number flex items-center mt-0.5">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mr-1 flex-shrink-0" />
                            {playerMatches}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS FOOTER */}
                      <div className="flex items-center gap-2 pt-1">
                        <Link 
                          to={`/players/${playerId}`} 
                          className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#081b29] border border-slate-200 dark:border-slate-700 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white hover:border-teal-500 transition-all duration-200"
                        >
                          Tactical Dossier
                        </Link>
                        <button 
                          onClick={() => handleAddToShortlist(playerId)} 
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-400/50 hover:bg-amber-400/10 transition-colors"
                          title="Add to Shortlist"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {isFilterModalOpen && (
        <Modal title="Save Tactical Filter Preset" onClose={() => setIsFilterModalOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Filter Preset Name
              </label>
              <input 
                type="text" 
                value={filterName} 
                onChange={e => setFilterName(e.target.value)} 
                placeholder="e.g. Elite U19 Wingers (GPI 75+)" 
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={() => setIsFilterModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveFilter} disabled={!filterName.trim()}>Save Preset</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
