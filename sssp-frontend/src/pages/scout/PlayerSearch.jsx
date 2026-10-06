import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Save, Users, Star, ArrowUpDown, MapPin, CheckCircle, Award } from 'lucide-react';
import { scoutService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

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
  
  // View toggle
  const [viewMode, setViewMode] = useState('grid');

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
      const response = await scoutService.searchPlayers(filters);
      setResults(response.data || []);
    } catch (err) {
      setError('Failed to fetch players. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

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
      // Show success toast here if implemented
    } catch (err) {
      setError('Failed to save filter.');
    }
  };

  const togglePlayerSelection = (id) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedPlayers.length > 1) {
      navigate(`/scout/compare?ids=${selectedPlayers.join(',')}`);
    }
  };

  const handleAddToShortlist = async (playerId) => {
    try {
      await scoutService.addToShortlist(playerId);
      // Show success msg
    } catch (err) {
      setError('Failed to add to shortlist.');
    }
  };

  const renderGPIBadge = (gpi) => {
    let color = 'bg-gray-100 text-gray-800';
    if (gpi >= 61) color = 'bg-green-100 text-green-800';
    else if (gpi >= 31) color = 'bg-yellow-100 text-yellow-800';
    else if (gpi > 0) color = 'bg-red-100 text-red-800';
    
    return <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>GPI: {gpi || 'N/A'}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-1/4 space-y-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center text-gray-900"><Filter className="w-5 h-5 mr-2"/> Filters</h2>
            <button onClick={handleClear} className="text-sm text-blue-600 hover:text-blue-800">Clear</button>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input type="text" value={filters.query} onChange={e => setFilters({...filters, query: e.target.value})} placeholder="Name, team..." className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map(pos => (
                  <button type="button" key={pos} onClick={() => handlePositionToggle(pos)}
                    className={`px-2 py-1 text-xs rounded border ${filters.positions.includes(pos) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select value={filters.ageGroup} onChange={e => setFilters({...filters, ageGroup: e.target.value})} className="w-full p-2 border border-gray-300 rounded">
                <option value="">Any</option>
                {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPI Range</label>
              <div className="flex items-center space-x-2">
                <input type="number" min="0" max="100" placeholder="Min" value={filters.minGpi} onChange={e => setFilters({...filters, minGpi: e.target.value})} className="w-full p-2 border border-gray-300 rounded"/>
                <span className="text-gray-500">-</span>
                <input type="number" min="0" max="100" placeholder="Max" value={filters.maxGpi} onChange={e => setFilters({...filters, maxGpi: e.target.value})} className="w-full p-2 border border-gray-300 rounded"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Verified Matches</label>
              <input type="number" min="0" value={filters.minMatches} onChange={e => setFilters({...filters, minMatches: e.target.value})} className="w-full p-2 border border-gray-300 rounded"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} placeholder="City, Region..." className="w-full p-2 border border-gray-300 rounded"/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Confidence</label>
              <select value={filters.dataConfidence} onChange={e => setFilters({...filters, dataConfidence: e.target.value})} className="w-full p-2 border border-gray-300 rounded">
                <option value="">Any</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="pt-4 space-y-2 border-t border-gray-200">
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Apply Filters</button>
              <button type="button" onClick={() => setIsFilterModalOpen(true)} className="w-full py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center font-medium">
                <Save className="w-4 h-4 mr-2"/> Save Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 space-y-4">
        {error && <Alert type="error" message={error} />}
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">{results.length} Players Found</span>
            {selectedPlayers.length > 0 && (
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {selectedPlayers.length} Selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedPlayers.length > 1 && (
              <button onClick={handleCompare} className="flex items-center px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm">
                <Users className="w-4 h-4 mr-2" /> Compare
              </button>
            )}
            <div className="flex items-center border border-gray-300 rounded">
              <select value={filters.sortBy} onChange={e => { setFilters({...filters, sortBy: e.target.value}); fetchResults(); }} className="p-2 border-none bg-transparent text-sm focus:ring-0">
                <option value="gpi">Sort by GPI</option>
                <option value="recent_form">Recent Form</option>
                <option value="matches_played">Matches Played</option>
              </select>
              <button type="button" onClick={() => { setFilters({...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc'}); fetchResults(); }} className="p-2 text-gray-500 hover:text-gray-700 border-l border-gray-300">
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><LoadingSpinner /></div>
        ) : results.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No players found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {results.map(player => (
              <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
                <div className="absolute top-3 left-3 z-10">
                  <input type="checkbox" checked={selectedPlayers.includes(player.id)} onChange={() => togglePlayerSelection(player.id)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"/>
                </div>
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 ml-8">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{player.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1"/> {player.location || 'Unknown'}
                      </p>
                    </div>
                    {renderGPIBadge(player.gpi)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 mb-4 text-sm">
                    <div><span className="text-gray-500 block text-xs">Position</span><span className="font-medium text-gray-900">{player.position}</span></div>
                    <div><span className="text-gray-500 block text-xs">Age</span><span className="font-medium text-gray-900">{player.age}</span></div>
                    <div><span className="text-gray-500 block text-xs">Team/Academy</span><span className="font-medium text-gray-900">{player.team || '-'}</span></div>
                    <div><span className="text-gray-500 block text-xs">Verified Matches</span><span className="font-medium text-gray-900 flex items-center"><CheckCircle className="w-3 h-3 text-blue-500 mr-1"/>{player.verifiedMatches}</span></div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                    <Link to={`/scout/player/${player.id}`} className="flex-1 text-center py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded border border-gray-200 text-sm font-medium transition-colors">
                      View Profile
                    </Link>
                    <button onClick={() => handleAddToShortlist(player.id)} className="p-2 text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 border border-gray-200 rounded transition-colors" title="Add to Shortlist">
                      <Star className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFilterModalOpen && (
        <Modal title="Save Filter" onClose={() => setIsFilterModalOpen(false)}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name</label>
              <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="e.g., U17 Strikers High GPI" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveFilter} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" disabled={!filterName.trim()}>Save Filter</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
