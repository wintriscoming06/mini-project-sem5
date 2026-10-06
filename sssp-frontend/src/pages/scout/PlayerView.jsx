import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { playerService, scoutService } from '../../services/api';
import { User, Activity, Star, Award, MapPin, Calendar, ClipboardList, Send, Edit, Bookmark } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';

export default function PlayerView() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    profile: null, gpi: null, matchStats: [], ranking: null, observations: [], notes: []
  });
  
  const [obsForm, setObsForm] = useState({ matchId: '', tech: 3, tact: 3, phys: 3, psych: 3, comments: '' });
  const [submittingObs, setSubmittingObs] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false); // Should check from context/api ideally

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [profile, gpi, stats, ranking, obs, notes] = await Promise.all([
          playerService.getProfile(id).catch(() => ({ data: {} })),
          playerService.getGPI(id).catch(() => ({ data: {} })),
          playerService.getMatchStats(id).catch(() => ({ data: [] })),
          playerService.getRanking(id).catch(() => ({ data: {} })),
          scoutService.getObservations(id).catch(() => ({ data: [] })),
          scoutService.getNotes(id).catch(() => ({ data: [] }))
        ]);

        setData({
          profile: profile.data, gpi: gpi.data, matchStats: stats.data, 
          ranking: ranking.data, observations: obs.data, notes: notes.data
        });
      } catch (err) {
        setError('Failed to load player details');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleObsSubmit = async (e) => {
    e.preventDefault();
    setSubmittingObs(true);
    try {
      await scoutService.submitObservation(id, obsForm);
      // Refresh observations ideally, here we just mock add
      setData(prev => ({...prev, observations: [...prev.observations, {...obsForm, createdAt: new Date()}]}));
      setObsForm({ matchId: '', tech: 3, tact: 3, phys: 3, psych: 3, comments: '' });
    } catch (err) {
      alert("Failed to submit observation");
    } finally {
      setSubmittingObs(false);
    }
  };

  const toggleShortlist = async () => {
    try {
      if (isShortlisted) {
        await scoutService.removeFromShortlist(id); // Using ID assuming shortlist id correlates, may need adjust
      } else {
        await scoutService.addToShortlist(id);
      }
      setIsShortlisted(!isShortlisted);
    } catch (err) {
      alert("Failed to update shortlist");
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner /></div>;
  if (error || !data.profile) return <div className="p-6"><Alert type="error" message={error || "Player not found"} /></div>;

  const p = data.profile;
  const g = data.gpi;
  const s = data.matchStats;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-12">
      
      {/* Header Profile Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-slate-900 h-32"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="flex items-end space-x-5">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 shadow-sm">
                {p.name ? p.name.charAt(0) : <User />}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{p.name || 'Unknown Player'}</h1>
                <p className="text-gray-500 font-medium flex items-center mt-1">
                  {p.position} • {p.team || 'No Team'}
                </p>
              </div>
            </div>
            <button onClick={toggleShortlist} className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors mb-2 ${isShortlisted ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
              <Bookmark className={`w-4 h-4 mr-2 ${isShortlisted ? 'fill-current' : ''}`} />
              {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* SECTION 1: PLAYER-DECLARED */}
          <div className="bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b border-blue-200 flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="font-semibold text-blue-900 text-sm tracking-wide uppercase">Player-Declared Data</h2>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="block text-gray-500 text-xs">Age/DOB</span><span className="font-medium text-gray-900">{p.age || '-'}</span></div>
                <div><span className="block text-gray-500 text-xs">Preferred Foot</span><span className="font-medium text-gray-900">{p.preferredFoot || '-'}</span></div>
                <div className="col-span-2"><span className="block text-gray-500 text-xs">Location</span><span className="font-medium text-gray-900 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {p.location || '-'}</span></div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <span className="block text-gray-500 text-xs mb-1">Biography</span>
                <p className="text-gray-800">{p.bio || 'No biography provided.'}</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: SYSTEM-CALCULATED */}
          <div className="bg-white rounded-lg border border-purple-200 shadow-sm overflow-hidden">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-200 flex items-center">
              <Activity className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="font-semibold text-purple-900 text-sm tracking-wide uppercase">System-Calculated</h2>
            </div>
            <div className="p-4 space-y-5">
              <div className="text-center">
                <span className="block text-gray-500 text-xs mb-1">Global Performance Index (GPI)</span>
                <div className={`text-4xl font-black ${(g?.value || 0) >= 60 ? 'text-green-600' : (g?.value || 0) >= 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {g?.value || 'N/A'}
                </div>
                {g?.isProvisional && <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">Provisional</span>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-gray-600">Data Confidence</span><span className="font-medium">{g?.confidence || 'Unknown'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600">Recent Form</span><span className="font-medium">{g?.recentForm || '-'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600">Consistency</span><span className="font-medium">{g?.consistency || '-'}</span></div>
              </div>

              {data.ranking && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="block text-gray-500 text-xs mb-2">Rankings</span>
                  <div className="flex items-center text-sm"><Award className="w-4 h-4 text-yellow-500 mr-2"/> #{data.ranking.overall || '-'} Overall</div>
                  <div className="flex items-center text-sm mt-1"><Award className="w-4 h-4 text-gray-400 mr-2"/> #{data.ranking.position || '-'} in Position</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle/Right Column */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* SECTION 2: ORGANIZER-VERIFIED */}
          <div className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200 flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="font-semibold text-green-900 text-sm tracking-wide uppercase">Organizer-Verified Data</h2>
              </div>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">{s.length} Matches</span>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Match/Tournament</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Min</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">G/A</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Cards</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {s.length > 0 ? s.map((match, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="font-medium text-gray-900">{match.title || 'Match'}</div><div className="text-xs text-gray-500">{match.tournament}</div></td>
                      <td className="px-4 py-3 text-gray-500">{match.date ? new Date(match.date).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 text-center">{match.minutes || '-'}</td>
                      <td className="px-4 py-3 text-center font-medium">{match.goals || 0}/{match.assists || 0}</td>
                      <td className="px-4 py-3 text-center">{(match.yellowCards || match.redCards) ? <span className="text-yellow-600">{match.yellowCards}Y</span> : '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No verified matches recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: SCOUT-OBSERVED */}
          <div className="bg-white rounded-lg border border-orange-200 shadow-sm overflow-hidden">
            <div className="bg-orange-50 px-4 py-3 border-b border-orange-200 flex items-center">
              <ClipboardList className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="font-semibold text-orange-900 text-sm tracking-wide uppercase">Scout-Observed Data</h2>
            </div>
            
            <div className="p-4">
              {user?.permissions?.includes('EVALUATOR') ? (
                <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 flex items-center mb-4"><Edit className="w-4 h-4 mr-2"/> Submit New Observation</h3>
                  <form onSubmit={handleObsSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['tech', 'tact', 'phys', 'psych'].map(cat => (
                        <div key={cat}>
                          <label className="block text-xs font-medium text-gray-700 capitalize mb-1">{cat} Rating (1-5)</label>
                          <select value={obsForm[cat]} onChange={(e)=>setObsForm({...obsForm, [cat]: Number(e.target.value)})} className="w-full border-gray-300 rounded-md text-sm p-2 bg-white">
                            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                      <textarea rows="3" value={obsForm.comments} onChange={(e)=>setObsForm({...obsForm, comments: e.target.value})} required className="w-full border-gray-300 rounded-md text-sm p-2" placeholder="Detailed scout notes..."></textarea>
                    </div>
                    <button type="submit" disabled={submittingObs} className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 flex items-center">
                      <Send className="w-4 h-4 mr-2" /> Submit Observation
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mb-6 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                  You do not have evaluator permissions to submit structured observations.
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Past Observations</h3>
                {data.observations.length > 0 ? (
                  <div className="space-y-3">
                    {data.observations.map((obs, i) => (
                      <div key={i} className="border border-gray-200 rounded p-3 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{obs.scoutName || 'Anonymous Scout'}</span>
                          <span className="text-gray-500 text-xs">{obs.createdAt ? new Date(obs.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="flex space-x-4 mb-2 text-xs text-gray-600">
                          <span>Tech: <strong className="text-gray-900">{obs.tech}/5</strong></span>
                          <span>Tact: <strong className="text-gray-900">{obs.tact}/5</strong></span>
                          <span>Phys: <strong className="text-gray-900">{obs.phys}/5</strong></span>
                          <span>Psych: <strong className="text-gray-900">{obs.psych}/5</strong></span>
                        </div>
                        <p className="text-gray-700">{obs.comments}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No observations recorded for this player.</p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
