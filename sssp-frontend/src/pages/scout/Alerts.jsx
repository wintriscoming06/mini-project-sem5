import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCircle2, AlertTriangle, Info, Clock, Filter, ArrowLeft } from 'lucide-react';
import { scoutService } from '../../services/api';
import { LoadingSpinner, Alert, Button, StatusBadge, EmptyState } from '../../components/common';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim, WhistleIcon } from '../../components/common/FootballIcons';

export default function ScoutAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await scoutService.getAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      setError('Failed to load scouting alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await scoutService.markAlertRead(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
    } catch (err) {
      setError('Failed to update alert status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = alerts.filter(a => !a.read);
      await Promise.all(unread.map(a => scoutService.markAlertRead(a.id)));
      setAlerts(alerts.map(a => ({ ...a, read: true })));
    } catch (err) {
      setError('Failed to update all alerts.');
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'UNREAD') return !a.read;
    if (filter === 'READ') return a.read;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const getReasonIcon = (reason) => {
    switch(reason) {
      case 'NEW_ELIGIBILITY': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'THRESHOLD_CROSSING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'CONFIRMED_MATCH': return <Info className="w-5 h-5 text-teal-500" />;
      default: return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  if (loading) return <div className="p-16 flex justify-center"><LoadingSpinner size="lg" text="Loading scouting intelligence alerts..." /></div>;

  return (
    <div className="space-y-6">
      
      {/* Stadium Pitch Hero Banner */}
      <PitchHero
        title="Scouting Intelligence Radar"
        subtitle="Real-time prospect eligibility milestones, GPI rating threshold surges, and confirmed match stats."
        badgeText="RADAR ALERTS"
        stats={[
          { label: 'Total Dispatch', value: alerts.length },
          { label: 'Unread Alerts', value: unreadCount }
        ]}
        actionButtons={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Dashboard
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="secondary" 
                onClick={handleMarkAllRead} 
                icon={<Check className="w-4 h-4 mr-1" />}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      {error && <Alert type="error" message={error} />}

      {/* Filter Tabs & Alert List */}
      <div className="relative bg-white dark:bg-[#0b1e2d] border border-slate-200 dark:border-emerald-900/40 rounded-2xl shadow-sm overflow-hidden">
        {/* Pitch Grass Top Trim */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600" />
        {/* Goal Net Texture */}
        <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />
        <div className="border-b border-slate-100 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#071622] flex gap-2">
          {['ALL', 'UNREAD', 'READ'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors ${
                filter === f 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'ALL' ? 'All Alerts' : f === 'UNREAD' ? `Unread (${unreadCount})` : 'Archived'}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredAlerts.length === 0 ? (
            <EmptyState 
              title="No alerts found" 
              message="No scouting notifications match your current tab selection." 
              icon={<Bell className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
            />
          ) : (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-5 flex flex-col md:flex-row gap-4 transition-colors ${
                  !alert.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 h-fit self-start">
                  {getReasonIcon(alert.triggerReason)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {alert.playerName}
                    </h3>
                    <StatusBadge status="INFO" label={alert.triggerReason} />
                    {!alert.read && <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    Triggered by tactical filter: <span className="font-bold text-teal-600 dark:text-teal-400">"{alert.filterName || 'Automated Monitor'}"</span>
                  </p>
                  <span className="flex items-center text-[10px] text-slate-400">
                    <Clock className="w-3 h-3 mr-1" /> {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-row md:flex-col justify-end items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/players/${alert.playerId}`)}
                  >
                    View Dossier
                  </Button>
                  {!alert.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleMarkRead(alert.id)}
                      className="text-xs text-teal-600 dark:text-teal-400"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
