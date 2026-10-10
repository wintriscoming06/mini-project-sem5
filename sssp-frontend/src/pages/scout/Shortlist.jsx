import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { scoutService } from '../../services/api';
import { Star, Trash2, Edit3, Eye, Search, Plus, GitCompare, FileText } from 'lucide-react';
import { LoadingSpinner, Alert, ConfirmDialog, Modal, Button, StatusBadge, EmptyState, FootballIcon, ScoutTargetIcon } from '../../components/common';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim } from '../../components/common/FootballIcons';

export default function Shortlist() {
  const navigate = useNavigate();
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [noteModal, setNoteModal] = useState({ isOpen: false, playerId: null, currentNote: '' });

  const fetchShortlist = async () => {
    try {
      setLoading(true);
      const res = await scoutService.getShortlist();
      setShortlist(res.data || []);
    } catch (err) {
      setError('Failed to load scouting shortlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlist();
  }, []);

  const handleRemove = async () => {
    if (!deleteId) return;
    try {
      await scoutService.removeFromShortlist(deleteId);
      setShortlist(shortlist.filter(item => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError('Failed to remove prospect from shortlist');
      setDeleteId(null);
    }
  };

  const handleSaveNote = async () => {
    try {
      await scoutService.addNote(noteModal.playerId, noteModal.currentNote);
      setShortlist(shortlist.map(item => 
        item.playerId === noteModal.playerId ? { ...item, note: noteModal.currentNote } : item
      ));
      setNoteModal({ isOpen: false, playerId: null, currentNote: '' });
    } catch (err) {
      setError('Failed to save scouting note');
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    setShortlist(shortlist.map(item => item.id === id ? { ...item, priority: Number(newPriority) } : item).sort((a,b) => a.priority - b.priority));
  };

  const highPriorityCount = shortlist.filter(i => i.priority === 1).length;

  if (loading) return <div className="p-16 flex justify-center"><LoadingSpinner size="lg" text="Loading prioritized shortlist..." /></div>;

  return (
    <div className="space-y-6">
      
      {/* Stadium Pitch Hero Banner */}
      <PitchHero
        title="Scouting Shortlist"
        subtitle="Prioritize high-value talent prospects, log private tactical notes, and evaluate comparative performance."
        badgeText="SCOUT TARGET RADAR"
        stats={[
          { label: 'Watched Prospects', value: shortlist.length },
          { label: 'High Priority', value: highPriorityCount }
        ]}
        actionButtons={
          <Button 
            variant="primary" 
            onClick={() => navigate('/search')}
            icon={Search}
          >
            Discover Prospects
          </Button>

        }
      />

      {error && <Alert type="error" message={error} />}

      {shortlist.length === 0 ? (
        <EmptyState 
          title="Shortlist is Empty" 
          message="You have not starred or prioritized any prospect dossiers yet." 
          icon={<Star className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
          action={<Button onClick={() => navigate('/search')}>Search Player Directory</Button>}
        />
      ) : (
        <div className="relative bg-white dark:bg-[#0b1e2d] rounded-2xl shadow-sm border border-slate-200 dark:border-emerald-900/40 overflow-hidden">
          {/* Pitch Grass Top Trim */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600" />
          {/* Goal Net Texture */}
          <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />
          
          <div className="overflow-x-auto relative z-10">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-[#071622] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  <th className="px-5 py-3.5 text-center w-20">Priority</th>
                  <th className="px-5 py-3.5 text-left">Prospect</th>
                  <th className="px-5 py-3.5 text-center">GPI Rating</th>
                  <th className="px-5 py-3.5 text-left">Private Scout Observation Note</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {shortlist.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-center">
                      <input 
                        type="number" 
                        min="1" 
                        max="99" 
                        value={item.priority || 1} 
                        onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                        className="w-14 px-2 py-1 text-center font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#081b29] border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black border border-teal-500/30">
                          {item.playerName ? item.playerName.charAt(0) : 'P'}
                        </div>
                        <div>
                          <Link 
                            to={`/players/${item.playerId}`} 
                            className="font-bold text-slate-900 dark:text-white hover:text-teal-500 transition-colors block"
                          >
                            {item.playerName}
                          </Link>
                          <span className="text-xs text-slate-400">{item.position || 'FWD'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base stat-number block">
                        {item.gpi ? Number(item.gpi).toFixed(1) : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.verifiedMatches || 0} Matches</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm truncate">
                        {item.note || <span className="text-slate-400 italic">No notes recorded</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/players/${item.playerId}`)}
                          title="View Player Dossier"
                        >
                          <Eye className="w-4 h-4 text-teal-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setNoteModal({ isOpen: true, playerId: item.playerId, currentNote: item.note || '' })}
                          title="Edit Observation Note"
                        >
                          <Edit3 className="w-4 h-4 text-emerald-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
                          title="Remove Prospect"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          title="Remove from Shortlist"
          message="Are you sure you want to remove this prospect from your scouting pipeline?"
          onConfirm={handleRemove}
          onClose={() => setDeleteId(null)}
          confirmText="Remove"
          variant="danger"
        />
      )}

      {noteModal.isOpen && (
        <Modal title="Scout Observation Note" onClose={() => setNoteModal({ isOpen: false, playerId: null, currentNote: '' })}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Field Observation Notes
              </label>
              <textarea
                rows={4}
                value={noteModal.currentNote}
                onChange={(e) => setNoteModal({...noteModal, currentNote: e.target.value})}
                placeholder="Record technical evaluation, tactical discipline, positioning notes..."
                className="w-full p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="secondary" onClick={() => setNoteModal({ isOpen: false, playerId: null, currentNote: '' })}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveNote}>Save Note</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
