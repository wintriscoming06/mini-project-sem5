import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Filter, CheckCircle } from 'lucide-react';
import { tournamentService } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, FormInput, StatusBadge, EmptyState } from '../../components/common';

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournamentsRes, appsRes] = await Promise.all([
        tournamentService.getAll().catch(() => ({ data: [] })),
        tournamentService.getMyApplications().catch(() => ({ data: [] }))
      ]);
      setTournaments(tournamentsRes.data || []);
      setMyApplications(appsRes.data || []);
    } catch (err) {
      setError('Failed to load tournaments.');
    } finally {
      setLoading(false);
    }
  };

  const getApplicationStatus = (tournamentId) => {
    const app = myApplications.find(a => a.tournamentId === tournamentId);
    return app ? app.status : null;
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="large" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Browse Tournaments</h1>
          <p className="text-gray-500">Find and apply to upcoming tournaments in your area.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Registration Open</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {filteredTournaments.length === 0 ? (
        <EmptyState 
          title="No tournaments found" 
          message="Try adjusting your search or filters." 
          icon={<Calendar className="w-12 h-12 text-gray-300" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t) => {
            const appStatus = getApplicationStatus(t.id);
            return (
              <div 
                key={t.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/player/tournaments/${t.id}`)}
              >
                <div className="h-2 bg-indigo-600"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 truncate" title={t.name}>{t.name}</h3>
                    <StatusBadge 
                      status={t.status === 'OPEN' ? 'SUCCESS' : t.status === 'ONGOING' ? 'WARNING' : 'DEFAULT'} 
                      label={t.status} 
                    />
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {t.location || t.venue || 'TBA'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {t.ageGroup} • {t.genderCategory} • {t.format}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Deadline: <span className="font-medium text-gray-900">{new Date(t.registrationDeadline).toLocaleDateString()}</span>
                    </div>
                    {appStatus ? (
                      <span className="inline-flex items-center text-sm font-medium text-indigo-600">
                        <CheckCircle className="w-4 h-4 mr-1" /> Applied
                      </span>
                    ) : t.status === 'OPEN' ? (
                      <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/player/tournaments/${t.id}`); }}>
                        Apply Now
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400">Closed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
