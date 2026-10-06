import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tournamentService, matchService } from '../../services/api';
import { Trophy, Calendar, Users, CheckCircle, Plus, ArrowRight, BarChart3, Activity } from 'lucide-react';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Assuming getAll can be filtered by organizer id if needed, 
        // or backend returns organizer's tournaments for this role.
        const [tournamentsRes, matchesRes] = await Promise.all([
          tournamentService.getAll(), 
          matchService.getAll()
        ]);
        
        // Filter if needed. Assuming API returns everything and we filter, or API is already scoped.
        // We will just use the responses for now.
        setTournaments(tournamentsRes.data || []);
        setMatches(matchesRes.data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;

  // Calculate stats
  const activeMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'SCHEDULED');
  const confirmedMatches = matches.filter(m => m.status === 'COMPLETED' && m.confirmed);
  // Assuming tournament applications count is sum of pending applications across tournaments
  // Mock pending count for now or calculate if available in tournament data
  let pendingApplicationsCount = 0;
  tournaments.forEach(t => {
    if (t.applications) {
        pendingApplicationsCount += t.applications.filter(a => a.status === 'PENDING').length;
    }
  });

  const recentTournaments = [...tournaments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
    
  const upcomingMatches = [...matches]
    .filter(m => m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Organizer'}!</h1>
          <p className="text-gray-500">Here's what's happening with your tournaments today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/organizer/tournaments/create">
            <Button icon={<Plus size={18} />}>Create Tournament</Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="My Tournaments" 
          value={tournaments.length} 
          icon={<Trophy size={24} className="text-blue-500" />} 
          trend="+1 this month"
          trendUp={true}
        />
        <StatsCard 
          title="Active Matches" 
          value={activeMatches.length} 
          icon={<Activity size={24} className="text-green-500" />} 
        />
        <StatsCard 
          title="Pending Applications" 
          value={pendingApplicationsCount} 
          icon={<Users size={24} className="text-yellow-500" />} 
          onClick={() => {}} // Could link to a unified applications view
        />
        <StatsCard 
          title="Confirmed Matches" 
          value={confirmedMatches.length} 
          icon={<CheckCircle size={24} className="text-indigo-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tournaments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy size={20} className="text-gray-500" />
              Recent Tournaments
            </h2>
            <Link to="/organizer/tournaments" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {recentTournaments.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No tournaments created yet. Click "Create Tournament" to get started.
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentTournaments.map(tournament => (
                <Card key={tournament.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{tournament.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(tournament.startDate).toLocaleDateString()}</span>
                        <span>{tournament.ageGroup} • {tournament.genderCategory}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <StatusBadge status={tournament.status} />
                      <Link to={`/organizer/tournaments/${tournament.id}`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              Upcoming Matches
            </h2>
            <Link to="/organizer/matches" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>

          <Card className="divide-y">
            {upcomingMatches.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No upcoming matches scheduled.
              </div>
            ) : (
              upcomingMatches.map(match => (
                <div key={match.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{match.tournament?.name || 'Tournament'}</span>
                    <StatusBadge status={match.status} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate max-w-[40%]">{match.homeTeam?.name || 'TBD'}</span>
                    <span className="text-xs text-gray-400 font-bold px-2">VS</span>
                    <span className="font-medium text-sm truncate max-w-[40%] text-right">{match.awayTeam?.name || 'TBD'}</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(match.date).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </span>
                    <Link to={`/organizer/matches/${match.id}/scoring`}>
                      <span className="text-xs font-medium text-blue-600 hover:text-blue-800">Score Match</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
      
      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
        <Link to="/organizer/tournaments/create">
          <Card className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-blue-500">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Plus size={20} /></div>
            <div>
              <h4 className="font-semibold text-gray-900">Create Tournament</h4>
              <p className="text-xs text-gray-500">Start a new competition</p>
            </div>
          </Card>
        </Link>
        <Link to="/organizer/matches">
          <Card className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-green-500">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><Calendar size={20} /></div>
            <div>
              <h4 className="font-semibold text-gray-900">View Matches</h4>
              <p className="text-xs text-gray-500">Manage schedule & scores</p>
            </div>
          </Card>
        </Link>
        <Link to="/organizer/tournaments">
          <Card className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-purple-500">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Users size={20} /></div>
            <div>
              <h4 className="font-semibold text-gray-900">Manage Applications</h4>
              <p className="text-xs text-gray-500">Review team requests</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
