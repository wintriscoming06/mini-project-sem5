import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, XCircle, Trophy, Calendar } from 'lucide-react';
import { tournamentService } from '../../services/api';
import { LoadingSpinner, Alert, Card, StatusBadge, Button, ConfirmDialog, EmptyState, TrophyIcon } from '../../components/common';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim } from '../../components/common/FootballIcons';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawDialog, setWithdrawDialog] = useState({ isOpen: false, appId: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await tournamentService.getMyApplications();
      setApplications(res.data || []);
    } catch (err) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setError(null);
      setApplications(applications.map(app => 
        app.id === withdrawDialog.appId ? { ...app, status: 'WITHDRAWN' } : app
      ));
      setWithdrawDialog({ isOpen: false, appId: null });
    } catch (err) {
      setError('Failed to withdraw application.');
      setWithdrawDialog({ isOpen: false, appId: null });
    }
  };

  const approvedCount = applications.filter(a => a.status === 'APPROVED' || a.status === 'ACCEPTED').length;

  if (loading) return <div className="flex h-96 items-center justify-center"><LoadingSpinner size="lg" text="Retrieving competition applications..." /></div>;

  return (
    <div className="space-y-6">
      <PitchHero
        title="Tournament Applications"
        subtitle="Track your competitive team registration entries, review statuses, and tournament approvals."
        badgeText="COMPETITOR ENTRIES"
        stats={[
          { label: 'Applications', value: applications.length },
          { label: 'Approved Entries', value: approvedCount }
        ]}
        actionButtons={
          <Button 
            variant="primary" 
            onClick={() => navigate('/tournaments')}
            icon={Trophy}
          >
            Browse Sanctioned Cups
          </Button>

        }
      />

      {error && <Alert type="error" message={error} />}

      <Card className="relative overflow-hidden border-2 border-emerald-900/30">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600 -mx-6 -mt-6 mb-6" />
        <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />
        {applications.length === 0 ? (
          <EmptyState 
            title="No Applications Submitted" 
            message="You have not registered for any upcoming competitive tournaments yet." 
            icon={<Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
            action={<Button onClick={() => navigate('/tournaments')}>Explore Sanctioned Tournaments</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-[#071622] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3.5 text-left">Tournament Competition</th>
                  <th className="px-5 py-3.5 text-left">Applied Date</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                          <TrophyIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {app.tournamentName || `Tournament #${app.tournamentId}`}
                          </span>
                          <span className="text-xs text-slate-400">
                            {app.tournamentLocation || 'Regional Competition'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 stat-number text-xs">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge 
                        status={app.status === 'APPROVED' ? 'ACTIVE' : app.status === 'PENDING' ? 'PENDING' : 'REJECTED'} 
                        label={app.status} 
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/tournaments/${app.tournamentId}`)}
                        >
                          View Details
                        </Button>
                        {app.status === 'PENDING' && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => setWithdrawDialog({ isOpen: true, appId: app.id })}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog 
        isOpen={withdrawDialog.isOpen}
        onClose={() => setWithdrawDialog({ isOpen: false, appId: null })}
        onConfirm={handleWithdraw}
        title="Withdraw Tournament Application"
        message="Are you sure you want to withdraw your tournament registration? This cannot be undone."
        variant="danger"
        confirmText="Confirm Withdrawal"
      />
    </div>
  );
};

export default MyApplications;
