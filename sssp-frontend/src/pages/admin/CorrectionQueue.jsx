import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { AlertCircle, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FootballIcon } from '../../components/common/FootballIcons';

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
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">APPROVED</span>;
      case 'REJECTED': return <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-xs font-bold">REJECTED</span>;
      default: return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold">PENDING</span>;
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white dark:bg-[#0b1e2d] rounded-2xl border border-slate-200 dark:border-emerald-950/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <AlertCircle className="w-7 h-7 mr-3 text-amber-500" /> Match Data Correction Queue
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Review player disputes on match logs, goals, assists, and disciplinary events before GPI recalculation.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="overflow-hidden">
        {/* Filter Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex gap-2 overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)} 
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                filter === f 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()} ({corrections.filter(c => f === 'ALL' || c.status === f).length})
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Match Details</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Requested Change</th>
                <th className="px-6 py-3 text-left font-bold tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-right font-bold tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCorrections.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    No {filter.toLowerCase()} corrections found.
                  </td>
                </tr>
              ) : (
                filteredCorrections.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(c.status)}
                        {getStatusBadge(c.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{c.matchTitle || 'Official Match Record'}</div>
                      <div className="text-xs text-slate-400">Player: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.player}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{c.targetField}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="line-through text-rose-500 font-bold">{c.oldValue || '0'}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{c.newValue}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">{c.submittedBy}</div>
                      <div className="text-xs text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedCorrection(c)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
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
      </Card>

      {/* Decision Modal */}
      {selectedCorrection && (
        <Modal 
          isOpen={!!selectedCorrection} 
          title="Review Match Stat Correction Request" 
          onClose={() => { setSelectedCorrection(null); setAdminNote(''); }}
        >
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Request Context</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400 block">Match</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCorrection.matchTitle}</span></div>
                <div><span className="text-slate-400 block">Player</span> <span className="font-semibold text-slate-900 dark:text-white">{selectedCorrection.player}</span></div>
                <div><span className="text-slate-400 block">Target Metric</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{selectedCorrection.targetField}</span></div>
                <div><span className="text-slate-400 block">Submitted</span> <span className="text-slate-700 dark:text-slate-300">{selectedCorrection.createdAt ? new Date(selectedCorrection.createdAt).toLocaleString() : '-'}</span></div>
              </div>
            </div>

            <div className="flex justify-center items-center space-x-8 p-4 bg-white dark:bg-[#06131b] border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-center">
                <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Current Logged</span>
                <span className="text-2xl font-black text-rose-500 line-through">{selectedCorrection.oldValue || '0'}</span>
              </div>
              <div className="text-slate-400 font-bold text-xl">→</div>
              <div className="text-center">
                <span className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Claimed Stat</span>
                <span className="text-2xl font-black text-emerald-500">{selectedCorrection.newValue}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Player Statement / Evidence</h4>
              <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl text-slate-700 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 italic">
                "{selectedCorrection.reason || 'No additional evidence statement provided.'}"
              </p>
            </div>

            {selectedCorrection.status === 'PENDING' ? (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Admin Verification Note</label>
                  <textarea 
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-emerald-500"
                    rows="2"
                    placeholder="State justification for approval or rejection..."
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="secondary" onClick={() => setSelectedCorrection(null)}>Cancel</Button>
                  <Button variant="danger" onClick={() => handleDecision('REJECTED')}>Reject Claim</Button>
                  <Button variant="primary" onClick={() => handleDecision('APPROVED')}>Verify & Approve</Button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedCorrection(null)}>Close</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
