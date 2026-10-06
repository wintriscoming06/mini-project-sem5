import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, FileText, Settings, Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-indigo-600" /> Platform Administration
          </h1>
          <p className="text-gray-500 mt-1">Manage users, review data corrections, and configure system rules.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.users.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Players</p>
            <h3 className="text-2xl font-bold text-gray-900">{userCounts.PLAYER}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Corrections</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingCorrections.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600"><FileText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Audit Logs</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.auditLogs.length}</h3>
          </div>
        </div>
      </div>

      {/* Role Breakdown Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Demographics</h3>
        <div className="flex gap-2">
          {['PLAYER', 'ORGANIZER', 'SCOUT', 'ADMIN'].map((role, i) => {
            const count = userCounts[role];
            if (count === 0) return null;
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];
            return (
              <div key={role} className={`${colors[i]} h-8 flex items-center justify-center text-white text-xs font-medium rounded px-2`} style={{width: `${(count/data.users.length)*100}%`}}>
                {role} ({count})
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions & Recent Logs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/users" className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors">
                <Users className="w-6 h-6 mb-2 text-blue-500" />
                <span className="font-medium text-sm">Manage Users</span>
              </Link>
              <Link to="/admin/corrections" className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-yellow-300 transition-colors relative">
                {pendingCorrections.length > 0 && <span className="absolute top-2 right-2 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>}
                <AlertTriangle className="w-6 h-6 mb-2 text-yellow-500" />
                <span className="font-medium text-sm">Review Corrections</span>
              </Link>
              <Link to="/admin/audit" className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-colors">
                <FileText className="w-6 h-6 mb-2 text-purple-500" />
                <span className="font-medium text-sm">Audit Log</span>
              </Link>
              <Link to="/admin/gpi-config" className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-colors">
                <Settings className="w-6 h-6 mb-2 text-indigo-500" />
                <span className="font-medium text-sm">GPI Config</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Audit Activity</h3>
              <Link to="/admin/audit" className="text-sm text-blue-600 flex items-center">View All <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="divide-y divide-gray-100">
              {data.auditLogs.slice(0, 5).map(log => (
                <div key={log.id} className="p-4 text-sm">
                  <div className="flex justify-between text-gray-500 mb-1 text-xs">
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                    <span className="font-medium text-gray-700">{log.entityType}</span>
                  </div>
                  <p className="text-gray-900"><span className="font-medium">{log.changedBy}</span> changed {log.entityType} (ID: {log.entityId})</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Corrections */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Pending Corrections</h3>
            <Link to="/admin/corrections" className="text-sm text-blue-600 flex items-center">View Queue <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingCorrections.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <p>No pending corrections.</p>
              </div>
            ) : (
              pendingCorrections.slice(0, 5).map(correction => (
                <div key={correction.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{correction.player} - {correction.matchTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">Field: <span className="font-medium">{correction.targetField}</span> | By: {correction.submittedBy}</p>
                  </div>
                  <Link to="/admin/corrections" className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded hover:bg-gray-50">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
