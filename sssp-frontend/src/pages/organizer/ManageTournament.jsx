import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tournamentService, matchService } from '../../services/api';
import { ArrowLeft, Calendar, MapPin, Users, Settings, Plus, Check, X, Edit, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormInput from '../../components/common/FormInput';

const ManageTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [tournament, setTournament] = useState(null);
  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [teamName, setTeamName] = useState('');
  const [matchData, setMatchData] = useState({ homeTeamId: '', awayTeamId: '', date: '', venue: '' });
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'applications', label: 'Applications' },
    { id: 'teams', label: 'Teams' },
    { id: 'matches', label: 'Matches' }
  ];

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const res = await tournamentService.getById(id);
      setTournament(res.data);
      if (activeTab === 'applications') fetchApplications();
      if (activeTab === 'teams') fetchTeams();
      if (activeTab === 'matches') fetchMatches();
    } catch (err) {
      setError("Failed to load tournament data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await tournamentService.getApplications(id);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await tournamentService.getTeams(id);
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    try {
      // Assuming matchService.getAll can filter by tournamentId
      const res = await matchService.getAll({ tournamentId: id });
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') fetchApplications();
    if (activeTab === 'teams') fetchTeams();
    if (activeTab === 'matches') fetchMatches();
  }, [activeTab]);

  const handleStatusUpdate = async () => {
    try {
      await tournamentService.updateStatus(id, newStatus);
      setShowStatusModal(false);
      fetchTournamentData();
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  const handleApplicationDecision = async (applicationId, status) => {
    try {
      await tournamentService.decideApplication(id, applicationId, status);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError("Failed to decide application.");
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await tournamentService.createTeam(id, { name: teamName });
      setShowTeamModal(false);
      setTeamName('');
      fetchTeams();
    } catch (err) {
      setError("Failed to create team.");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await tournamentService.addTeamMember(id, selectedTeamId, selectedPlayerId);
      setShowAddMemberModal(false);
      fetchTeams();
    } catch (err) {
      setError("Failed to add member.");
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await matchService.create({ ...matchData, tournamentId: id });
      setShowMatchModal(false);
      setMatchData({ homeTeamId: '', awayTeamId: '', date: '', venue: '' });
      fetchMatches();
    } catch (err) {
      setError("Failed to create match.");
    }
  };

  if (loading && !tournament) return <LoadingSpinner fullScreen text="Loading tournament..." />;
  if (!tournament) return <Alert type="error" message="Tournament not found." />;

  const validNextStatuses = {
    'DRAFT': ['OPEN'],
    'OPEN': ['REGISTRATION_CLOSED', 'ONGOING'],
    'REGISTRATION_CLOSED': ['ONGOING'],
    'ONGOING': ['COMPLETED'],
    'COMPLETED': []
  };

  const availableStatuses = validNextStatuses[tournament.status] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/organizer/tournaments')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-grow">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{tournament.name}</h1>
            <StatusBadge status={tournament.status} />
          </div>
          <p className="text-gray-500">{tournament.ageGroup} • {tournament.genderCategory} • {tournament.format}</p>
        </div>
        {availableStatuses.length > 0 && (
          <Button onClick={() => setShowStatusModal(true)}>Update Status</Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{tournament.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Venue</span>
                  <span className="font-medium text-gray-900">{tournament.venue || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium text-gray-900">{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium text-gray-900">{new Date(tournament.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500">Registration Deadline</span>
                  <span className="font-medium text-gray-900">{tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Applications</h2>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Applicant / Player</th>
                      <th className="px-6 py-3">Date Applied</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center">No applications found.</td></tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{app.player?.name || 'Unknown User'}</td>
                          <td className="px-6 py-4">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={app.status} size="sm" /></td>
                          <td className="px-6 py-4 text-right">
                            {app.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApplicationDecision(app.id, 'ACCEPTED')}
                                ><Check size={14} /> Accept</Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                                ><X size={14} /> Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Teams</h2>
              <Button icon={<Plus size={16} />} onClick={() => setShowTeamModal(true)}>Create Team</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No teams created yet.
                </div>
              ) : (
                teams.map(team => (
                  <Card key={team.id} className="p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <h3 className="font-bold text-lg">{team.name}</h3>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTeamId(team.id); setShowAddMemberModal(true); }}>Add Member</Button>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {team.members?.length > 0 ? (
                        team.members.map(member => (
                          <li key={member.id} className="flex justify-between items-center">
                            <span>{member.name}</span>
                            <button className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 italic">No members yet.</li>
                      )}
                    </ul>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Matches</h2>
              <Button icon={<Plus size={16} />} onClick={() => setShowMatchModal(true)}>Create Match</Button>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Match</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-8 text-center">No matches scheduled.</td></tr>
                    ) : (
                      matches.map(match => (
                        <tr key={match.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{match.homeTeam?.name || 'TBD'} vs {match.awayTeam?.name || 'TBD'}</td>
                          <td className="px-6 py-4">{new Date(match.date).toLocaleString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={match.status} size="sm" /></td>
                          <td className="px-6 py-4 font-bold">{match.status === 'COMPLETED' ? `${match.homeScore} - ${match.awayScore}` : '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/organizer/matches/${match.id}/scoring`}>
                              <Button size="sm" variant="outline">Manage Score</Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Tournament Status">
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Select the new status for this tournament:</p>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map(status => (
              <Button 
                key={status} 
                variant={newStatus === status ? 'primary' : 'outline'}
                onClick={() => setNewStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus}>Update Status</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4 py-4">
          <FormInput 
            label="Team Name" 
            value={teamName} 
            onChange={(e) => setTeamName(e.target.value)} 
            required 
            placeholder="Enter team name" 
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!teamName.trim()}>Create Team</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="Schedule Match">
        <form onSubmit={handleCreateMatch} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Team</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={matchData.homeTeamId}
                onChange={e => setMatchData({...matchData, homeTeamId: e.target.value})}
                required
              >
                <option value="">Select Home Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Away Team</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={matchData.awayTeamId}
                onChange={e => setMatchData({...matchData, awayTeamId: e.target.value})}
                required
              >
                <option value="">Select Away Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <FormInput 
            label="Date & Time" 
            type="datetime-local" 
            value={matchData.date} 
            onChange={e => setMatchData({...matchData, date: e.target.value})} 
            required 
          />
          <FormInput 
            label="Venue (Optional)" 
            value={matchData.venue} 
            onChange={e => setMatchData({...matchData, venue: e.target.value})} 
          />
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowMatchModal(false)}>Cancel</Button>
            <Button type="submit">Schedule Match</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add Team Member">
        <form onSubmit={handleAddMember} className="space-y-4 py-4">
          <p className="text-sm text-gray-600 mb-2">Select an accepted applicant to add to the team.</p>
          <select 
            className="w-full px-3 py-2 border rounded-md"
            value={selectedPlayerId}
            onChange={e => setSelectedPlayerId(e.target.value)}
            required
          >
            <option value="">Select Player</option>
            {applications.filter(a => a.status === 'ACCEPTED').map(a => (
              <option key={a.id} value={a.player?.id}>{a.player?.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!selectedPlayerId}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTournament;
