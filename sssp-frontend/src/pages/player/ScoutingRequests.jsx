import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, Calendar, Check, Copy, RefreshCw } from 'lucide-react';
import { playerService } from '../../services/api';
import { Card, Button, LoadingSpinner, Alert, EmptyState } from '../../components/common';
import PitchHero from '../../components/common/PitchHero';

export default function ScoutingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await playerService.getScoutingRequests();
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load scouting contact requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCopyNumber = (id, phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    handleMarkViewed(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleMarkViewed = async (requestId) => {
    try {
      await playerService.updateScoutingRequestStatus(requestId, 'VIEWED');
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'VIEWED' } : r));
    } catch (err) {
      console.warn('Could not update status:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stadium Pitch Hero Banner */}
      <PitchHero
        title="Scouting Contact Requests"
        subtitle="Direct connection requests and verified scouting inquiries from certified football recruiters"
        badgeText="TALENT RECRUITMENT RADAR"
        stats={[
          { label: "REQUESTS", value: requests.length },
          { label: "PENDING", value: requests.filter(r => r.status === 'PENDING').length }
        ]}
      />

      {error && (
        <Alert 
          type="error" 
          message={error} 
          action={
            <Button size="sm" variant="outline" onClick={fetchRequests} icon={<RefreshCw className="w-3.5 h-3.5 mr-1" />}>
              Retry
            </Button>
          } 
        />
      )}

      {loading ? (
        <div className="p-20 flex justify-center">
          <LoadingSpinner size="lg" text="Retrieving verified scouting requests..." />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No Scouting Requests Yet"
          message="You haven't received any scouting requests yet. When a scout is interested in your performances, their request will appear here."
          icon={<Mail className="w-12 h-12 text-slate-300 dark:text-slate-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const isCopied = copiedId === req.id;
            const isPending = req.status === 'PENDING';

            return (
              <Card
                key={req.id}
                className={`relative overflow-hidden border transition-all ${
                  isPending 
                    ? 'border-cyan-500/40 dark:border-cyan-500/30 shadow-md bg-white dark:bg-slate-900' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                }`}
              >
                {/* Status indicator bar */}
                <div 
                  className={`h-1.5 w-full absolute top-0 left-0 ${
                    isPending ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`} 
                />

                <div className="pt-2 space-y-4">
                  {/* Header: Scout info + Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                        {req.scoutName}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        <span className="truncate max-w-[200px]">{req.scoutOrganization || 'Independent Scout'}</span>
                      </div>
                    </div>

                    <span 
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isPending 
                          ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Scout's Message Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                    <p className="italic">"{req.message}"</p>
                  </div>

                  {/* Contact Snapshot & Date */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formatDate(req.createdAt)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        @{req.scoutUsername}
                      </span>
                    </div>

                    {/* Scout Contact Number Container */}
                    <div className="bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">
                            Scout Mobile Contact
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white tracking-wide">
                            {req.scoutContactNumber}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyNumber(req.id, req.scoutContactNumber)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        title="Copy contact number"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
