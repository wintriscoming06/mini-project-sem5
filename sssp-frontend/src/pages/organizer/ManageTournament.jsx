import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tournamentService, matchService } from '../../services/api';
import { ArrowLeft, Calendar, MapPin, Users, Settings, Plus, Check, X, Trash2, Trophy, Clock, Shield } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import PitchHero from '../../components/common/PitchHero';
import { TrophyIcon, StadiumIcon, FootballIcon, ClassicSoccerBall } from '../../components/common/FootballIcons';

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
    { id: 'overview', label: 'Overview', icon: TrophyIcon },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'teams', label: 'Squads & Teams', icon: Shield },
    { id: 'matches', label: 'Match Schedule', icon: FootballIcon }
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
      setError("Failed to schedule match.");
    }
  };

  if (loading && !tournament) return <LoadingSpinner fullScreen text="Loading tournament management console..." />;
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
      {/* 1. TOURNAMENT STADIUM PITCH HERO */}
      <PitchHero
        title={tournament.name}
        subtitle={`${tournament.location || 'Stadium Arena'} • Official Competition Management Console`}
        badgeText={`TOURNAMENT STATUS: ${tournament.status}`}
        stats={[
          { label: "SQUADS", value: teams.length },
          { label: "APPLICANTS", value: applications.length },
          { label: "FIXTURES", value: matches.length },
          { label: "FORMAT", value: tournament.format || "11v11" }
        ]}
        actionButtons={
          <>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/my-tournaments')}
              className="bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900"
              icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            >
              Tournaments
            </Button>
            {availableStatuses.length > 0 && (
              <Button 
                variant="primary" 
                icon={<Settings className="w-4 h-4" />} 
                onClick={() => setShowStatusModal(true)}
              >
                Advance Status
              </Button>
            )}
          </>
        }
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-200 mt-2">
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-400/40 text-emerald-300">
            {tournament.ageGroup || 'Open Age'}
          </span>
          <span>•</span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 border border-emerald-400/40 text-emerald-300">
            {tournament.genderCategory || 'All Genders'}
          </span>
          <span>•</span>
          <span className="text-amber-400 font-black">{tournament.venue || 'Central Pitch'}</span>
        </div>
      </PitchHero>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Football-styled Tabs */}
      <div className="flex border-b border-slate-200 dark:border-emerald-950/40 space-x-1 sm:space-x-3 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="py-2">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <StadiumIcon className="w-5 h-5 mr-2 text-emerald-500" />
                Tournament Parameters
              </h3>
              <div className="space-y-3 text-sm divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Host Location / City</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tournament.location || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Match Stadium / Venue</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tournament.venue || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Tournament Kickoff</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{new Date(tournament.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Finals / Conclusion Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{new Date(tournament.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 dark:text-slate-400">Player Application Deadline</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{tournament.registrationDeadline ? new Date(tournament.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Teams</span>
                  <Shield className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{teams.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for matchday scheduling</p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Applicants</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{applications.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Players registered for tournament</p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Matches</span>
                  <FootballIcon className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{matches.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Official fixtures created</p>
              </Card>
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Player Applications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review and verify player entry requests</p>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Applicant / Player</th>
                      <th className="px-6 py-3 font-semibold">Date Applied</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {applications.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          No applications submitted yet.
                        </td>
                      </tr>
                    ) : (
                      applications.map(app => (
                        <tr key={app.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                                {app.player?.name?.[0] || 'P'}
                              </div>
                              <div>
                                <div>{app.player?.name || 'Unknown User'}</div>
                                <div className="text-xs font-normal text-slate-400">{app.player?.email || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={app.status} size="sm" /></td>
                          <td className="px-6 py-4 text-right">
                            {app.status === 'PENDING' ? (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-emerald-600 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                  onClick={() => handleApplicationDecision(app.id, 'ACCEPTED')}
                                >
                                  <Check size={14} className="mr-1" /> Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-rose-600 border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                  onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                                >
                                  <X size={14} className="mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Decision Recorded</span>
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
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Squads & Teams</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Organize tournament rosters and assign registered players</p>
              </div>
              <Button icon={<Plus size={16} />} onClick={() => setShowTeamModal(true)}>Create Team</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.length === 0 ? (
                <div className="col-span-full p-12 text-center text-slate-400 bg-white dark:bg-[#0b1e2d] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <Shield className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="font-semibold">No teams created yet.</p>
                  <p className="text-xs mt-1">Create teams to assemble rosters from accepted tournament applicants.</p>
                </div>
              ) : (
                teams.map(team => (
                  <Card key={team.id} className="p-5">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{team.name}</h3>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTeamId(team.id); setShowAddMemberModal(true); }}>
                        <Plus size={14} className="mr-1" /> Add Player
                      </Button>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {team.members?.length > 0 ? (
                        team.members.map(member => (
                          <li key={member.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{member.name}</span>
                            <span className="text-xs text-slate-400">{member.primaryPosition || 'Player'}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic text-xs py-3 text-center">No squad members assigned yet.</li>
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
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tournament Fixtures</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Schedule official matches and enter live score events</p>
              </div>
              <Button icon={<Plus size={16} />} onClick={() => setShowMatchModal(true)}>Schedule Match</Button>
            </div>
            
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                  <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Fixture</th>
                      <th className="px-6 py-3 font-semibold">Kickoff Date</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Score</th>
                      <th className="px-6 py-3 text-right font-semibold">Scoring Desk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          <FootballIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          No matches scheduled yet.
                        </td>
                      </tr>
                    ) : (
                      matches.map(match => (
                        <tr key={match.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            <span className="text-emerald-600 dark:text-emerald-400">{match.homeTeam?.name || 'TBD'}</span>
                            <span className="mx-2 text-slate-400">vs</span>
                            <span className="text-blue-600 dark:text-blue-400">{match.awayTeam?.name || 'TBD'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{new Date(match.date).toLocaleString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={match.status} size="sm" /></td>
                          <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                            {match.status === 'COMPLETED' ? `${match.homeScore} - ${match.awayScore}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link to={`/organizer/matches/${match.id}/scoring`}>
                              <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                                Match Desk
                              </Button>
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

      {/* MODALS */}
      {/* Advance Status Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Advance Tournament Lifecycle">
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">Select the official transition status for this tournament:</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {availableStatuses.map(status => (
              <button 
                key={status} 
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  newStatus === status 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
                onClick={() => setNewStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus}>Confirm Update</Button>
          </div>
        </div>
      </Modal>

      {/* Create Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Register New Squad">
        <form onSubmit={handleCreateTeam} className="space-y-4 py-2">
          <FormInput 
            label="Squad / Team Name" 
            value={teamName} 
            onChange={(e) => setTeamName(e.target.value)} 
            required 
            placeholder="e.g. Red Dragons FC" 
          />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!teamName.trim()}>Register Team</Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Match Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="Schedule Official Match">
        <form onSubmit={handleCreateMatch} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Home Team</label>
              <select 
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-emerald-500"
                value={matchData.homeTeamId}
                onChange={e => setMatchData({...matchData, homeTeamId: e.target.value})}
                required
              >
                <option value="">Select Home Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Away Team</label>
              <select 
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-emerald-500"
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
            label="Kickoff Date & Time" 
            type="datetime-local" 
            value={matchData.date} 
            onChange={e => setMatchData({...matchData, date: e.target.value})} 
            required 
          />
          <FormInput 
            label="Pitch / Venue (Optional)" 
            value={matchData.venue} 
            onChange={e => setMatchData({...matchData, venue: e.target.value})} 
            placeholder="e.g. Pitch 1, Central Arena"
          />
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setShowMatchModal(false)}>Cancel</Button>
            <Button type="submit">Schedule Match</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Assign Accepted Player to Squad">
        <form onSubmit={handleAddMember} className="space-y-4 py-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Select an accepted tournament player to add to this squad roster:</p>
          <select 
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-emerald-500"
            value={selectedPlayerId}
            onChange={e => setSelectedPlayerId(e.target.value)}
            required
          >
            <option value="">Select Player</option>
            {applications.filter(a => a.status === 'ACCEPTED').map(a => (
              <option key={a.id} value={a.player?.id}>{a.player?.name || a.player?.username}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!selectedPlayerId}>Add Player</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTournament;
