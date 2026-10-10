import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, FileText, Settings, Activity, ChevronRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import { FootballIcon, WhistleIcon, StadiumIcon, ClassicSoccerBall } from '../../components/common/FootballIcons';
import PitchHero from '../../components/common/PitchHero';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    users: [],
    corrections: [],
    auditLogs: []
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersRes, correctionsRes, auditRes] = await Promise.all([
          adminService.getUsers().catch(() => ({ data: [] })),
          adminService.getCorrections().catch(() => ({ data: [] })),
          adminService.getAuditLogs().catch(() => ({ data: [] }))
        ]);

        setData({
          users: usersRes.data || [],
          corrections: correctionsRes.data || [],
          auditLogs: auditRes.data || []
        });
      } catch (err) {
        setError('Failed to load dashboard data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  const pendingCorrections = data.corrections.filter(c => c.status === 'PENDING');
  const userCounts = {
    PLAYER: data.users.filter(u => u.role === 'PLAYER').length,
    ORGANIZER: data.users.filter(u => u.role === 'ORGANIZER').length,
    SCOUT: data.users.filter(u => u.role === 'SCOUT').length,
    ADMIN: data.users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PitchHero
        title="SSSP System Administration"
        subtitle="Platform governance, verified match data certification, and GPI algorithm weights tuning."
        badgeText="FEDERATION GOVERNANCE"
        stats={[
          { label: 'Total Accounts', value: data.users.length },
          { label: 'Registered Players', value: userCounts.PLAYER }
        ]}
      />

      {error && <Alert type="error" message={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Accounts</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.users.length}</h3>
          </div>
        </Card>
        
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><FootballIcon className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Players</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{userCounts.PLAYER}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Corrections</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingCorrections.length}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audit Events</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.auditLogs.length}</h3>
          </div>
        </Card>
      </div>

      {/* Role Breakdown Bar */}
      <Card className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">User Distribution by Role</h3>
        <div className="flex gap-2 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
          {['PLAYER', 'ORGANIZER', 'SCOUT', 'ADMIN'].map((role, i) => {
            const count = userCounts[role];
            if (count === 0) return null;
            const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-600', 'bg-purple-600'];
            const pct = Math.round((count / (data.users.length || 1)) * 100);
            return (
              <div 
                key={role} 
                className={`${colors[i]} h-full flex items-center justify-center text-white text-xs font-bold px-2 truncate`} 
                style={{ width: `${Math.max(pct, 12)}%` }}
                title={`${role}: ${count} (${pct}%)`}
              >
                {role} ({count})
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions & Recent Logs */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Administration Modules</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/users" className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all group">
                <Users className="w-6 h-6 mb-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">User Accounts</span>
              </Link>
              <Link to="/admin/corrections" className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-amber-500/50 transition-all relative group">
                {pendingCorrections.length > 0 && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
                <AlertTriangle className="w-6 h-6 mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Data Corrections</span>
              </Link>
              <Link to="/admin/audit" className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-purple-500/50 transition-all group">
                <FileText className="w-6 h-6 mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Audit Trails</span>
              </Link>
              <Link to="/admin/gpi-config" className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-blue-500/50 transition-all group">
                <Settings className="w-6 h-6 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">GPI Weight Engine</span>
              </Link>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Recent Audit Events</h3>
              <Link to="/admin/audit" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline">
                View All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{log.entityType}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.changedBy}</span> modified {log.entityType}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Pending Corrections */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Pending Corrections</h3>
            <Link to="/admin/corrections" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center hover:underline">
              Full Queue <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingCorrections.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="font-semibold">All match records verified.</p>
                <p className="text-xs text-slate-400 mt-0.5">No pending player data correction disputes.</p>
              </div>
            ) : (
              pendingCorrections.slice(0, 5).map(correction => (
                <div key={correction.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{correction.player} - {correction.matchTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Stat: <span className="font-bold text-emerald-600 dark:text-emerald-400">{correction.targetField}</span> | Submitted by: {correction.submittedBy}
                    </p>
                  </div>
                  <Link 
                    to="/admin/corrections" 
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
