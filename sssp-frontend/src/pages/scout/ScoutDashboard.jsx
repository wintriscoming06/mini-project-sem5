import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Bell, Eye, Filter, UserCheck, ChevronRight, AlertCircle } from 'lucide-react';
import { scoutService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import StatsCard from '../../components/common/StatsCard';

export default function ScoutDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    shortlist: [],
    alerts: [],
    filters: [],
    observations: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using Promise.all to fetch all dashboard data concurrently
        const [shortlistRes, alertsRes, filtersRes] = await Promise.all([
          scoutService.getShortlist().catch(() => ({ data: [] })),
          scoutService.getAlerts().catch(() => ({ data: [] })),
          scoutService.getFilters().catch(() => ({ data: [] }))
        ]);
        
        setData({
          shortlist: shortlistRes.data || [],
          alerts: alertsRes.data || [],
          filters: filtersRes.data || [],
          observations: [] // Placeholder if no direct endpoint for user observations exists yet
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scout/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadAlerts = data.alerts.filter(a => !a.read);
  const topShortlist = [...data.shortlist].sort((a, b) => (a.priority || 99) - (b.priority || 99)).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Scout'}!</h1>
          <p className="text-gray-500">Here's your latest scouting overview.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/scout/search" className="btn-primary flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" /> Search Players
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Shortlisted</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.shortlist.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600"><Filter className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Saved Filters</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.filters.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-red-100 text-red-600"><Bell className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Unread Alerts</p>
            <h3 className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600"><Eye className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Observations</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.observations.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
            <form onSubmit={handleQuickSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search players by name, location, or team..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                Find
              </button>
            </form>
          </div>

          {/* Top Shortlist */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Top Shortlisted</h3>
              <Link to="/scout/shortlist" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="p-0">
              {topShortlist.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {topShortlist.map(player => (
                    <li key={player.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                          {player.name ? player.name.charAt(0) : '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{player.name}</p>
                          <p className="text-xs text-gray-500">{player.position} • {player.team || 'No Team'}</p>
                        </div>
                      </div>
                      <Link to={`/scout/player/${player.playerId}`} className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200">
                        Profile
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Star className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>Your shortlist is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
              <Link to="/scout/alerts" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="p-0">
              {data.alerts.slice(0, 5).length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {data.alerts.slice(0, 5).map(alert => (
                    <li key={alert.id} className={`p-4 ${!alert.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <Link to={`/scout/player/${alert.playerId}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {alert.playerName}
                        </Link>
                        <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-700">
                        <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
                        {alert.triggerReason}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>No recent alerts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
