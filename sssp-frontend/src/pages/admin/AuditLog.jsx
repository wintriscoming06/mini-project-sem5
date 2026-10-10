import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { FileText, Search, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAuditLogs();
        setLogs(res.data || []);
      } catch (err) {
        setError('Failed to fetch audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredLogs = logs.filter(log => filterType === 'ALL' || log.entityType === filterType);

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white dark:bg-[#0b1e2d] rounded-2xl border border-slate-200 dark:border-emerald-950/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <FileText className="w-7 h-7 mr-3 text-purple-500" /> Platform Audit Trail
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Immutable log of system changes, score approvals, GPI weight adjustments, and administrative access.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filter Entity:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs py-1.5 px-3 text-slate-900 dark:text-white focus:ring-emerald-500"
            >
              <option value="ALL">All Entities</option>
              <option value="USER">User Accounts</option>
              <option value="PLAYER_STATS">Player Stats</option>
              <option value="GPI_CONFIG">GPI Config</option>
              <option value="CORRECTION">Dispute Corrections</option>
            </select>
          </div>
          <div className="text-xs text-slate-400">
            Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredLogs.length}</span> records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left w-8"></th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Entity Type</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Changed By</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Action Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No audit logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleExpand(log.id)} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {expandedId === log.id ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-xs">{log.entityType}</span>
                        <span className="text-slate-400 text-xs ml-2">ID: {log.entityId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white text-xs">
                        {log.changedBy}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 truncate max-w-xs">
                        {log.reason || 'System operation'}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-slate-50/80 dark:bg-slate-900/60">
                        <td colSpan="5" className="px-14 py-4 border-b border-slate-200 dark:border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                              <h5 className="font-bold text-rose-500 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">Previous State</h5>
                              <pre className="text-rose-600 dark:text-rose-400 overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                                {JSON.stringify(log.oldValue || {}, null, 2)}
                              </pre>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                              <h5 className="font-bold text-emerald-500 mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">Updated State</h5>
                              <pre className="text-emerald-600 dark:text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                                {JSON.stringify(log.newValue || {}, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
