import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCircle2, AlertTriangle, Info, Clock, Filter } from 'lucide-react';
import { scoutService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function ScoutAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await scoutService.getAlerts();
      setAlerts(res.data || []);
    } catch (err) {
      setError('Failed to load alerts');
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
      setError('Failed to update alert');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Assuming a mass mark endpoint exists or we do it iteratively
      const unread = alerts.filter(a => !a.read);
      await Promise.all(unread.map(a => scoutService.markAlertRead(a.id)));
      setAlerts(alerts.map(a => ({ ...a, read: true })));
    } catch (err) {
      setError('Failed to update all alerts');
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
      case 'NEW_ELIGIBILITY': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'THRESHOLD_CROSSING': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED_MATCH': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const getReasonBadge = (reason) => {
    switch(reason) {
      case 'NEW_ELIGIBILITY': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">New Eligibility</span>;
      case 'THRESHOLD_CROSSING': return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Threshold Crossed</span>;
      case 'CONFIRMED_MATCH': return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Match Confirmed</span>;
      default: return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">{reason}</span>;
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2" /> System Alerts
          </h1>
          <p className="text-gray-500 mt-1">Stay updated on players matching your filters.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} Unread
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
              <Check className="w-4 h-4 mr-1" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 p-4 flex gap-4">
          <button onClick={() => setFilter('ALL')} className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
          <button onClick={() => setFilter('UNREAD')} className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${filter === 'UNREAD' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Unread</button>
          <button onClick={() => setFilter('READ')} className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${filter === 'READ' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Read</button>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p>No alerts found matching your criteria.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div key={alert.id} className={`p-5 flex flex-col md:flex-row gap-4 hover:bg-gray-50 transition-colors ${!alert.read ? 'bg-blue-50/30' : ''}`}>
                <div className="flex-shrink-0 mt-1">
                  {getReasonIcon(alert.triggerReason)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{alert.playerName}</h3>
                    {getReasonBadge(alert.triggerReason)}
                    {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Triggered by your filter: <span className="font-medium">"{alert.filterName}"</span>
                  </p>
                  <div className="flex items-center text-xs text-gray-400 gap-4">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-end items-center gap-2 md:w-32 flex-shrink-0">
                  <Link to={`/scout/player/${alert.playerId}`} className="w-full text-center px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    View Player
                  </Link>
                  {!alert.read && (
                    <button onClick={() => handleMarkRead(alert.id)} className="w-full px-3 py-1.5 text-blue-600 rounded text-sm font-medium hover:bg-blue-50 transition-colors">
                      Mark Read
                    </button>
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
