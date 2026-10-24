import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Trophy, ChevronLeft, Clock, Shield, CheckCircle } from 'lucide-react';
import { tournamentService } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, StatusBadge, TrophyIcon } from '../../components/common';
import { PitchMarkings } from '../../components/common/FootballIcons';

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
      
      const app = (appsRes.data || []).find(a => String(a.tournamentId) === String(id));
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
      setError(err?.response?.data?.message || err.message || 'Failed to apply for tournament.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Loading tournament details..." /></div>;
  if (!tournament) return <div className="p-6"><Alert type="error" message="Tournament not found." /></div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/tournaments')} 
        className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Competitions
      </button>

      {error && <Alert type="error" message={error} />}

      {/* Matchday Stadium Header Arena Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 shadow-xl text-white">
        {/* Subtle Blueprint Lines */}
        <PitchMarkings className="absolute inset-0 opacity-10 pointer-events-none text-blue-400" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 border border-white/10 p-3 flex items-center justify-center text-amber-400 shadow-xl flex-shrink-0 backdrop-blur-md">
              <TrophyIcon className="w-10 h-10" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusBadge 
                  status={tournament.status === 'OPEN' ? 'ACTIVE' : tournament.status === 'ONGOING' ? 'LIVE' : 'COMPLETED'} 
                  label={tournament.status} 
                />
                <span className="text-xs text-slate-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                  Organizer: <strong className="text-white">{tournament.organizerName || 'Certified SSSP Organizer'}</strong>
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">{tournament.name}</h1>
            </div>
          </div>

          <div className="flex items-center">
            {applicationStatus ? (
              <div className="flex items-center space-x-2 bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl shadow-lg">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-slate-200">Application {applicationStatus}</span>
              </div>
            ) : tournament.status === 'OPEN' ? (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <div className="text-right sm:text-left bg-black/40 border border-white/10 px-3.5 py-2 rounded-xl text-xs text-slate-300">
                  <span className="text-amber-400 font-bold block">Offline Registration Open</span>
                  <span>Contact tournament organizer to join squad</span>
                </div>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={handleApply} 
                  disabled={applying}
                  icon={Trophy}
                >
                  {applying ? 'Submitting...' : 'Register Interest'}
                </Button>
              </div>
            ) : (
              <span className="text-sm text-slate-300 bg-black/40 border border-white/10 px-4 py-2 rounded-xl">Registrations Closed</span>
            )}
          </div>
        </div>

        {/* Fixture Key Details Row */}
        <div className="relative z-10 bg-slate-950/80 backdrop-blur-md border-t border-white/10 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400 mr-2.5 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Tournament Window</p>
              <p className="font-bold text-white stat-number">
                {new Date(tournament.startDate).toLocaleDateString()} — {new Date(tournament.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400 mr-2.5 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Host Stadium / Venue</p>
              <p className="font-bold text-white truncate">{tournament.location || tournament.venue || 'TBA'}</p>
            </div>
          </div>

          <div className="flex items-center text-slate-300">
            <Users className="w-4 h-4 text-sky-400 mr-2.5 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Category & Format</p>
              <p className="font-bold text-white">{tournament.ageGroup || 'Open'} • {tournament.format || 'Standard 11v11'}</p>
            </div>
          </div>

          <div className="flex items-center text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 mr-2.5 flex-shrink-0" />
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold">Registration Closes</p>
              <p className="font-bold text-amber-300 stat-number">{new Date(tournament.registrationDeadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Overview & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Tournament Dossier" subtitle="Overview and competition regulations">
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>{tournament.description || 'This sanctioned competition provides registered athletes with verified competitive match logs that feed directly into the SSSP General Player Index (GPI) analytics engine.'}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Scouting & Verification" icon={Shield}>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Sanctioned Status</span>
                <span className="font-bold text-blue-500">Official SSSP Fixture</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Scout Access</span>
                <span className="font-bold text-slate-900 dark:text-white">Active Dossier Feed</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>GPI Scoring</span>
                <span className="font-bold text-slate-900 dark:text-white">Full Quantitative Calibration</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
