import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { FileText, Search, ChevronDown, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-purple-600" /> Audit Log
        </h1>
        <p className="text-gray-500 mt-1">Review system changes and administrative actions.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter Entity:</span>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border-gray-300 rounded-md text-sm py-1.5 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="ALL">All Entities</option>
              <option value="USER">User</option>
              <option value="PLAYER_STATS">Player Stats</option>
              <option value="GPI_CONFIG">GPI Config</option>
              <option value="CORRECTION">Correction</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredLogs.length} records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Entity Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Action summary</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No audit logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleExpand(log.id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {expandedId === log.id ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-medium text-xs">{log.entityType}</span>
                        <span className="text-gray-400 text-xs ml-2">ID: {log.entityId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {log.changedBy}
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                        {log.reason || 'System update'}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="5" className="px-14 py-4 border-b border-gray-200">
                          <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                              <h5 className="font-bold text-gray-700 mb-2 border-b pb-2">Old Value</h5>
                              <pre className="text-red-600 overflow-x-auto whitespace-pre-wrap text-xs">
                                {JSON.stringify(log.oldValue || {}, null, 2)}
                              </pre>
                            </div>
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                              <h5 className="font-bold text-gray-700 mb-2 border-b pb-2">New Value</h5>
                              <pre className="text-green-600 overflow-x-auto whitespace-pre-wrap text-xs">
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
      </div>
    </div>
  );
}
