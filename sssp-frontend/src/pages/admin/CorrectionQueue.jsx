import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { AlertCircle, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function CorrectionQueue() {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('PENDING'); // ALL, PENDING, APPROVED, REJECTED
  
  const [selectedCorrection, setSelectedCorrection] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const fetchCorrections = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCorrections();
      setCorrections(res.data || []);
    } catch (err) {
      setError('Failed to fetch corrections queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleDecision = async (status) => {
    if (!selectedCorrection) return;
    try {
      await adminService.decideCorrection(selectedCorrection.id, { status, adminNote });
      setCorrections(corrections.map(c => c.id === selectedCorrection.id ? { ...c, status } : c));
      setSelectedCorrection(null);
      setAdminNote('');
    } catch (err) {
      setError(`Failed to ${status.toLowerCase()} correction.`);
    }
  };

  const filteredCorrections = corrections.filter(c => filter === 'ALL' || c.status === filter);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">APPROVED</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold">REJECTED</span>;
      default: return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">PENDING</span>;
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <AlertCircle className="w-6 h-6 mr-2 text-yellow-500" /> Correction Queue
        </h1>
        <p className="text-gray-500 mt-1">Review and approve data correction requests submitted by players.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 p-4 flex gap-4">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${filter === f ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change Request</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCorrections.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No {filter.toLowerCase()} corrections found.</td></tr>
              ) : (
                filteredCorrections.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(c.status)}
                        {getStatusBadge(c.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{c.matchTitle || 'Unknown Match'}</div>
                      <div className="text-sm text-gray-500">Player: {c.player}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">{c.targetField}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="line-through text-red-500">{c.oldValue || '0'}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-bold text-green-600">{c.newValue}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{c.submittedBy}</div>
                      <div className="text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedCorrection(c)}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCorrection && (
        <Modal title="Review Correction Request" onClose={() => { setSelectedCorrection(null); setAdminNote(''); }}>
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Match</span> <span className="font-medium">{selectedCorrection.matchTitle}</span></div>
                <div><span className="text-gray-500 block">Player</span> <span className="font-medium">{selectedCorrection.player}</span></div>
                <div><span className="text-gray-500 block">Target Field</span> <span className="font-medium capitalize">{selectedCorrection.targetField}</span></div>
                <div><span className="text-gray-500 block">Date Submitted</span> <span>{selectedCorrection.createdAt ? new Date(selectedCorrection.createdAt).toLocaleString() : '-'}</span></div>
              </div>
            </div>

            <div className="flex justify-center items-center space-x-8 p-4 border border-gray-200 rounded-lg">
              <div className="text-center">
                <span className="block text-sm text-gray-500 mb-1">Current Value</span>
                <span className="text-2xl font-bold text-red-500 line-through">{selectedCorrection.oldValue || '0'}</span>
              </div>
              <div className="text-gray-400 font-bold text-xl">→</div>
              <div className="text-center">
                <span className="block text-sm text-gray-500 mb-1">Requested Value</span>
                <span className="text-2xl font-bold text-green-600">{selectedCorrection.newValue}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-1 text-sm">Player's Reason</h4>
              <p className="bg-gray-50 p-3 rounded text-gray-700 text-sm border border-gray-200">
                {selectedCorrection.reason || 'No reason provided.'}
              </p>
            </div>

            {selectedCorrection.status === 'PENDING' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (Optional)</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-blue-500"
                    rows="2"
                    placeholder="Provide a reason for rejection or approval note..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button onClick={() => setSelectedCorrection(null)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                  <button onClick={() => handleDecision('REJECTED')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                  <button onClick={() => handleDecision('APPROVED')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                </div>
              </>
            )}
            
            {selectedCorrection.status !== 'PENDING' && (
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button onClick={() => setSelectedCorrection(null)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Close</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
