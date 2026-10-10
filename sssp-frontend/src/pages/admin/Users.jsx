import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Filter, Shield, User, UserCheck, ShieldOff } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Card from '../../components/common/Card';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [confirmAction, setConfirmAction] = useState(null); // { user, actionType, payload }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!confirmAction) return;
    const { user, payload } = confirmAction;
    try {
      await adminService.updateUser(user.id, payload);
      // Update local state
      setUsers(users.map(u => u.id === user.id ? { ...u, ...payload } : u));
      setConfirmAction(null);
    } catch (err) {
      setError('Failed to update user');
      setConfirmAction(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.username?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      SCOUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      ORGANIZER: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      PLAYER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
    };
    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full ${styles[role] || 'bg-slate-100 text-slate-800'}`}>
        {role}
      </span>
    );
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white dark:bg-[#0b1e2d] rounded-2xl border border-slate-200 dark:border-emerald-950/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Platform User Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage accounts, security roles, and scouting access privileges.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-400 w-4 h-4" />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Roles</option>
            <option value="PLAYER">Players</option>
            <option value="ORGANIZER">Organizers</option>
            <option value="SCOUT">Scouts</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-bold tracking-wider">User</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Platform Role</th>
                <th className="px-6 py-3 text-center font-bold tracking-wider">Status</th>
                <th className="px-6 py-3 text-center font-bold tracking-wider">Verified Evaluator</th>
                <th className="px-6 py-3 text-right font-bold tracking-wider">Permissions & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No users found matching query.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-9 w-9 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">
                          {user.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                        <div className="ml-3">
                          <div className="font-bold text-slate-900 dark:text-white">{user.username}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-bold rounded-full ${user.isActive !== false ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.permissions?.includes('EVALUATOR') ? (
                        <UserCheck className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <select 
                          value={user.role}
                          onChange={(e) => setConfirmAction({ user, actionType: 'ROLE', payload: { role: e.target.value } })}
                          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg py-1 px-2 focus:ring-emerald-500"
                        >
                          <option value="PLAYER">Player</option>
                          <option value="ORGANIZER">Organizer</option>
                          <option value="SCOUT">Scout</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        
                        <button 
                          onClick={() => setConfirmAction({ user, actionType: 'STATUS', payload: { isActive: user.isActive === false } })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            user.isActive !== false 
                              ? 'border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40' 
                              : 'border-emerald-200 dark:border-emerald-900/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {user.isActive !== false ? 'Suspend' : 'Activate'}
                        </button>
                        
                        <button 
                          onClick={() => setConfirmAction({ user, actionType: 'PERMISSION', payload: { permissions: user.permissions?.includes('EVALUATOR') ? [] : ['EVALUATOR'] } })}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          title="Toggle Evaluator Permission"
                        >
                          {user.permissions?.includes('EVALUATOR') ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title="Confirm User Permission Modification"
          message={`Are you sure you want to update permissions/role for ${confirmAction.user.username}?`}
          onConfirm={handleUpdateUser}
          onClose={() => setConfirmAction(null)}
          confirmText="Yes, Update User"
        />
      )}
    </div>
  );
}
