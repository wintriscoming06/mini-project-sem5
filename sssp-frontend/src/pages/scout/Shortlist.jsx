import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scoutService } from '../../services/api';
import { Star, Trash2, Edit3, Eye, Search, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';

export default function Shortlist() {
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
      setError('Failed to load shortlist');
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
      setError('Failed to remove player from shortlist');
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
      setError('Failed to save note');
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    // Optimistic update
    setShortlist(shortlist.map(item => item.id === id ? { ...item, priority: Number(newPriority) } : item).sort((a,b) => a.priority - b.priority));
    // In a real app, you'd trigger an API call to save priority here
  };

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Star className="w-6 h-6 mr-2 text-yellow-500" /> My Shortlist
          </h1>
          <p className="text-gray-500 mt-1">Manage and track players you're observing.</p>
        </div>
        <Link to="/scout/search" className="btn-primary flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Players
        </Link>
      </div>

      {error && <Alert type="error" message={error} />}

      {shortlist.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-200">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Your shortlist is empty</h3>
          <p className="text-gray-500 mt-2 mb-6">Start searching for players to add them to your shortlist.</p>
          <Link to="/scout/search" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" /> Go to Player Search
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shortlist.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="number" 
                        min="1" 
                        max="99" 
                        value={item.priority || 99} 
                        onChange={(e) => handlePriorityChange(item.id, e.target.value)}
                        className="w-16 p-1 text-center border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                          {item.playerName ? item.playerName.charAt(0) : '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.playerName}</div>
                          <div className="text-sm text-gray-500">{item.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">GPI: {item.gpi || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{item.verifiedMatches || 0} Matches</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {item.note || <span className="text-gray-400 italic">No notes added</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/scout/player/${item.playerId}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Profile">
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => setNoteModal({ isOpen: true, playerId: item.playerId, currentNote: item.note || '' })} 
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="Edit Note">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setDeleteId(item.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove">
                          <Trash2 className="w-5 h-5" />
                        </button>
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
          message="Are you sure you want to remove this player from your shortlist?"
          onConfirm={handleRemove}
          onCancel={() => setDeleteId(null)}
          confirmText="Remove"
          type="danger"
        />
      )}

      {noteModal.isOpen && (
        <Modal title="Edit Scout Note" onClose={() => setNoteModal({ isOpen: false, playerId: null, currentNote: '' })}>
          <div className="p-4 space-y-4">
            <textarea
              rows="4"
              value={noteModal.currentNote}
              onChange={(e) => setNoteModal({...noteModal, currentNote: e.target.value})}
              placeholder="Enter your private observation notes here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setNoteModal({ isOpen: false, playerId: null, currentNote: '' })} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveNote} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Note</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
