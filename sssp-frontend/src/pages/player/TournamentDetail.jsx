import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, ChevronLeft, Clock, Shield } from 'lucide-react';
import { tournamentService } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, StatusBadge, DataTable } from '../../components/common';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tournRes, appsRes] = await Promise.all([
        tournamentService.getById(id),
        tournamentService.getMyApplications().catch(() => ({ data: [] }))
      ]);
      setTournament(tournRes.data);
      
      const app = (appsRes.data || []).find(a => a.tournamentId === id);
      if (app) setApplicationStatus(app.status);
    } catch (err) {
      setError('Failed to load tournament details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setError(null);
      await tournamentService.apply(id);
      setApplicationStatus('PENDING');
    } catch (err) {
      setError(err.message || 'Failed to apply for tournament.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="large" /></div>;
  if (!tournament) return <div className="p-6"><Alert type="error" message="Tournament not found." /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate('/player/tournaments')} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-4">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tournaments
      </button>

      {error && <Alert type="error" message={error} />}

      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-900 to-purple-800 flex items-center px-8 relative">
          <Trophy className="w-24 h-24 text-white opacity-10 absolute right-8" />
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <StatusBadge status={tournament.status === 'OPEN' ? 'SUCCESS' : tournament.status === 'ONGOING' ? 'WARNING' : 'DEFAULT'} label={tournament.status} />
              <span className="text-indigo-100 text-sm">Organizer: {tournament.organizerName || 'Unknown'}</span>
            </div>
            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 text-indigo-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Dates</p>
              <p className="font-medium">{new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 text-indigo-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium">{tournament.location || tournament.venue}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <Users className="w-5 h-5 text-indigo-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="font-medium">{tournament.ageGroup} • {tournament.genderCategory}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-700">
            <Shield className="w-5 h-5 text-indigo-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Format</p>
              <p className="font-medium">{tournament.format}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Tournament Information">
            <div className="prose max-w-none text-gray-600">
              <p>{tournament.description || 'No description provided.'}</p>
              <h4 className="text-sm font-bold text-gray-900 mt-4 mb-2">Rules & Guidelines</h4>
              <p>{tournament.rules || 'Standard rules apply.'}</p>
            </div>
          </Card>

          <Card title="Participating Teams">
            {tournament.teams && tournament.teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tournament.teams.map((team, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{team.name}</h4>
                      <p className="text-xs text-gray-500">{team.playersCount || 0} Players</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm py-4">Teams have not been announced yet.</p>
            )}
          </Card>

          <Card title="Recent Matches">
            {tournament.matches && tournament.matches.length > 0 ? (
              <p className="text-sm text-gray-600">Match data is available.</p>
            ) : (
              <p className="text-gray-500 italic text-sm py-4">No match data available yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Registration">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Deadline</span>
                <span className="font-medium text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(tournament.registrationDeadline).toLocaleDateString()}
                </span>
              </div>
              
              <div className="pt-4">
                {applicationStatus ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Your Application Status</p>
                    <StatusBadge 
                      status={applicationStatus === 'ACCEPTED' ? 'SUCCESS' : applicationStatus === 'REJECTED' ? 'ERROR' : applicationStatus === 'WITHDRAWN' ? 'DEFAULT' : 'WARNING'} 
                      label={applicationStatus} 
                    />
                    {applicationStatus === 'PENDING' && (
                      <p className="text-xs text-gray-400 mt-3">Waiting for organizer review.</p>
                    )}
                  </div>
                ) : tournament.status === 'OPEN' ? (
                  <Button 
                    className="w-full justify-center" 
                    onClick={handleApply} 
                    disabled={applying}
                  >
                    {applying ? 'Applying...' : 'Apply as Individual Player'}
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Registration Closed</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
