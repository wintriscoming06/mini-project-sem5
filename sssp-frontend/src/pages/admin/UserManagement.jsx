import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Filter, Shield, User, UserCheck, ShieldOff } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';

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
      ADMIN: 'bg-red-100 text-red-800',
      SCOUT: 'bg-orange-100 text-orange-800',
      ORGANIZER: 'bg-green-100 text-green-800',
      PLAYER: 'bg-blue-100 text-blue-800'
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[role] || 'bg-gray-100 text-gray-800'}`}>{role}</span>;
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage accounts, roles, and platform access.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="PLAYER">Players</option>
            <option value="ORGANIZER">Organizers</option>
            <option value="SCOUT">Scouts</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluator</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.permissions?.includes('EVALUATOR') ? (
                        <UserCheck className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <select 
                          value={user.role}
                          onChange={(e) => setConfirmAction({ user, actionType: 'ROLE', payload: { role: e.target.value } })}
                          className="text-xs border-gray-300 rounded focus:ring-blue-500 py-1"
                        >
                          <option value="PLAYER">Player</option>
                          <option value="ORGANIZER">Organizer</option>
                          <option value="SCOUT">Scout</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        
                        <button 
                          onClick={() => setConfirmAction({ user, actionType: 'STATUS', payload: { isActive: user.isActive === false } })}
                          className={`px-2 py-1 rounded text-xs font-medium border ${user.isActive !== false ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'}`}
                        >
                          {user.isActive !== false ? 'Disable' : 'Enable'}
                        </button>
                        
                        <button 
                          onClick={() => setConfirmAction({ user, actionType: 'PERMISSION', payload: { permissions: user.permissions?.includes('EVALUATOR') ? [] : ['EVALUATOR'] } })}
                          className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200"
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
      </div>

      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title="Confirm Action"
          message={`Are you sure you want to update ${confirmAction.user.username}?`}
          onConfirm={handleUpdateUser}
          onCancel={() => setConfirmAction(null)}
          confirmText="Yes, Update"
        />
      )}
    </div>
  );
}
