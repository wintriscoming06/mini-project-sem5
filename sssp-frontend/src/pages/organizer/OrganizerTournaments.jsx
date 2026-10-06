import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { Plus, Search, Filter, Calendar, MapPin, Users, Settings } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';

const OrganizerTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  
  const statusTabs = ['All', 'DRAFT', 'OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'];

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentService.getAll();
      setTournaments(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tournaments", err);
      setError("Could not load tournaments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    filter === 'All' ? true : t.status === filter
  );

  if (loading) return <LoadingSpinner fullScreen text="Loading tournaments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tournaments</h1>
          <p className="text-gray-500">Manage and organize your sports events</p>
        </div>
        <Link to="/organizer/tournaments/create">
          <Button icon={<Plus size={18} />}>Create Tournament</Button>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 border-b border-gray-200 hide-scrollbar">
        <div className="flex space-x-8">
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                whitespace-nowrap py-2 border-b-2 font-medium text-sm transition-colors
                ${filter === tab 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <EmptyState 
          icon={<Trophy size={48} className="text-gray-400" />}
          title={`No ${filter !== 'All' ? filter.toLowerCase() : ''} tournaments found`}
          description={filter === 'All' ? "You haven't created any tournaments yet." : `You have no tournaments with status ${filter}.`}
          action={
            <Link to="/organizer/tournaments/create">
              <Button>Create One Now</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <Card key={tournament.id} className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-5 flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{tournament.name}</h3>
                  <StatusBadge status={tournament.status} />
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{tournament.ageGroup}</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{tournament.genderCategory}</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{tournament.format}</span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="truncate">{tournament.venue}, {tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>0 Applications</span> {/* In real app, bind to tournament.applicationsCount */}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
                <Link to={`/organizer/tournaments/${tournament.id}`} className="w-full">
                  <Button variant="primary" className="w-full flex justify-center items-center gap-2">
                    <Settings size={16} /> Manage
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Quick Trophy Icon for EmptyState since it wasn't imported from lucide-react above
const Trophy = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

export default OrganizerTournaments;
