import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { 
  Plus, ArrowRight, Trophy, Shield 
} from 'lucide-react';
import { 
  StatsCard, Card, StatusBadge, LoadingSpinner, Alert, 
  Button, TrophyIcon, PitchHero 
} from '../../components/common';

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tournamentsRes = await tournamentService.getMyTournaments().catch(() => tournamentService.getAll());
        setTournaments(tournamentsRes.data || []);
      } catch (err) {
        setError('Failed to load tournament operations data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading matchday stadium operations..." /></div>;

  const activeTournaments = tournaments.filter(t => t.status === 'OPEN' || t.status === 'ONGOING');
  const completedTournaments = tournaments.filter(t => t.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      <PitchHero
        title="Tournament Operations Console"
        subtitle="Manage official competitions, register team rosters, enter match results and feed player GPI statistics."
        badgeText="ORGANIZER HEADQUARTERS"
        stats={[
          { label: "MY TOURNAMENTS", value: tournaments.length },
          { label: "ACTIVE", value: activeTournaments.length },
          { label: "COMPLETED", value: completedTournaments.length }
        ]}
        actionButtons={
          <Button 
            variant="primary" 
            onClick={() => navigate('/tournaments/create')}
            icon={<Plus className="w-4 h-4 mr-1.5" />}
          >
            Create Tournament
          </Button>
        }
      />

      {error && <Alert type="error" message={error} />}

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard 
          title="Total Sanctioned" 
          value={tournaments.length} 
          icon={<TrophyIcon className="w-6 h-6 text-amber-400" />} 
          color="amber"
        />
        <StatsCard 
          title="Active Leagues" 
          value={activeTournaments.length} 
          icon={<Shield className="w-6 h-6 text-blue-400" />} 
          color="blue"
        />
        <StatsCard 
          title="Completed Tournaments" 
          value={completedTournaments.length} 
          icon={<Trophy className="w-6 h-6 text-emerald-400" />} 
          color="emerald"
        />
      </div>

      {/* RECENT TOURNAMENTS */}
      <Card
        title="My Tournaments"
        subtitle="Recent competitions under your direct operational administration"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/my-tournaments')}>
            View All ({tournaments.length}) <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        }
      >
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No tournaments registered yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first football competition to register clubs and enter player stats.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => navigate('/tournaments/create')}>
                Create First Tournament
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tournaments.slice(0, 5).map(t => (
              <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t.name}</h4>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {t.venue || 'Stadium TBA'}, {t.location || 'City TBA'} • {t.startDate || 'TBA'}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate(`/tournaments/${t.id}/manage`)}
                >
                  Manage Tournament
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrganizerDashboard;
