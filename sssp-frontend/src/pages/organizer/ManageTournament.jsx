import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { 
  ArrowLeft, Plus, Shield, Trophy, Users, BarChart3, 
  Trash2, Edit3, Calendar, MapPin, CheckCircle, Search, AlertCircle 
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import PitchHero from '../../components/common/PitchHero';
import { TrophyIcon, FootballIcon } from '../../components/common/FootballIcons';

const ManageTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState([]);
  const [playersList, setPlayersList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Forms state
  const [newStatus, setNewStatus] = useState('');
  const [teamName, setTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');

  // Match Fixture state
  const [matchForm, setMatchForm] = useState({ homeTeamId: '', awayTeamId: '', matchDateTime: '', venue: '' });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreForm, setScoreForm] = useState({ homeScore: 0, awayScore: 0 });

  // Player Stats Form (exact GPI input fields)
  const initialStatsForm = {
    id: null,
    playerId: '',
    teamId: '',
    position: 'CM',
    matchKind: 'OFFICIAL',
    stars: 3,
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    shots: 0,
    shotsOnTarget: 0,
    passesAttempted: 0,
    passesCompleted: 0,
    keyPasses: 0,
    dribblesAttempted: 0,
    dribblesCompleted: 0,
    tackles: 0,
    interceptions: 0,
    clearances: 0,
    duelsWon: 0,
    yellowCards: 0,
    redCards: 0
  };
  const [statsForm, setStatsForm] = useState(initialStatsForm);

  const tabs = [
    { id: 'overview', label: 'Tournament Info', icon: TrophyIcon },
    { id: 'teams', label: 'Teams & Squad Lineups', icon: Shield },
    { id: 'matches', label: 'Fixtures & Scores', icon: FootballIcon },
    { id: 'stats', label: 'Player Stats & GPI Engine', icon: BarChart3 }
  ];

  useEffect(() => {
    fetchTournament();
    loadPlayers();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'teams') fetchTeams();
    if (activeTab === 'matches') fetchMatches();
    if (activeTab === 'stats') {
      fetchStats();
      fetchTeams();
    }
  }, [activeTab, id]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const res = await tournamentService.getById(id);
      setTournament(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError('Failed to load tournament data.');
    } finally {
      setLoading(false);
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
      const res = await tournamentService.getTournamentMatches(id);
      setMatches(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await tournamentService.getTournamentStats(id);
      setStats(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlayers = async (q = '') => {
    try {
      const res = await tournamentService.searchPlayers(q);
      setPlayersList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setError(null);
      await tournamentService.updateStatus(id, newStatus);
      setSuccess(`Tournament status updated to ${newStatus}`);
      setShowStatusModal(false);
      fetchTournament();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      setError(null);
      await tournamentService.createTeam(id, { name: teamName });
      setTeamName('');
      setShowTeamModal(false);
      setSuccess('Team registered successfully');
      fetchTeams();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create team');
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedPlayerId) return;
    try {
      setError(null);
      await tournamentService.addTeamMember(id, selectedTeamId, selectedPlayerId);
      setShowAddMemberModal(false);
      setSelectedPlayerId('');
      setSuccess('Player assigned to team squad');
      fetchTeams();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to add squad player');
    }
  };

  const handleRemoveTeamMember = async (teamId, playerId) => {
    if (!window.confirm('Remove player from team squad?')) return;
    try {
      setError(null);
      await tournamentService.removeTeamMember(teamId, playerId);
      setSuccess('Player removed from squad');
      fetchTeams();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await tournamentService.createTournamentMatch(id, matchForm);
      setMatchForm({ homeTeamId: '', awayTeamId: '', matchDateTime: '', venue: '' });
      setShowMatchModal(false);
      setSuccess('Fixture scheduled successfully');
      fetchMatches();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create fixture');
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    try {
      setError(null);
      await tournamentService.updateMatchScore(id, selectedMatch.id, scoreForm);
      setShowScoreModal(false);
      setSelectedMatch(null);
      setSuccess('Match score certified and completed');
      fetchMatches();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update score');
    }
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await tournamentService.savePlayerStats(id, statsForm);
      setShowStatsModal(false);
      setStatsForm(initialStatsForm);
      setSuccess('Player stats saved and GPI automatically recalculated');
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save stats');
    }
  };

  const handleDeleteStats = async (statsId) => {
    if (!window.confirm('Delete this player tournament stats entry? This will recalculate the player GPI.')) return;
    try {
      setError(null);
      await tournamentService.deletePlayerStats(id, statsId);
      setSuccess('Stats entry deleted and GPI updated');
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete stats');
    }
  };

  const openEditStats = (item) => {
    setStatsForm({
      id: item.id,
      playerId: item.playerId,
      teamId: item.teamId || '',
      position: item.position || 'CM',
      matchKind: item.matchKind || 'OFFICIAL',
      stars: item.stars || 3,
      minutesPlayed: item.minutesPlayed ?? 90,
      goals: item.goals ?? 0,
      assists: item.assists ?? 0,
      shots: item.shots ?? 0,
      shotsOnTarget: item.shotsOnTarget ?? 0,
      passesAttempted: item.passesAttempted ?? 0,
      passesCompleted: item.passesCompleted ?? 0,
      keyPasses: item.keyPasses ?? 0,
      dribblesAttempted: item.dribblesAttempted ?? 0,
      dribblesCompleted: item.dribblesCompleted ?? 0,
      tackles: item.tackles ?? 0,
      interceptions: item.interceptions ?? 0,
      clearances: item.clearances ?? 0,
      duelsWon: item.duelsWon ?? 0,
      yellowCards: item.yellowCards ?? 0,
      redCards: item.redCards ?? 0
    });
    setShowStatsModal(true);
  };

  if (loading) return <div className="p-20 flex justify-center"><LoadingSpinner size="lg" text="Loading tournament management console..." /></div>;
  if (!tournament) return <div className="p-6"><Alert type="error" message="Tournament not found." /></div>;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/my-tournaments')} 
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Tournaments
        </button>

        <div className="flex items-center space-x-3">
          <StatusBadge status={tournament.status} />
          <Button size="sm" variant="outline" onClick={() => setShowStatusModal(true)}>
            Update Status
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Hero Header */}
      <PitchHero
        title={tournament.name}
        subtitle={`${tournament.location || tournament.venue || 'Stadium Venue TBA'} • ${tournament.ageGroup || 'Open'} • ${tournament.format || 'Standard'}`}
        badgeText="ORGANIZER TOURNAMENT DESK"
        stats={[
          { label: 'TEAMS', value: teams.length },
          { label: 'FIXTURES', value: matches.length },
          { label: 'PLAYERS ENTERED', value: stats.length },
          { label: 'STATUS', value: tournament.status }
        ]}
      />

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-blue-900/40 space-x-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Tournament Dossier" subtitle="Basic configuration and regulations">
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400">Competition Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{tournament.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400">Venue & City</span>
                <span>{tournament.venue || 'TBA'}, {tournament.location || 'TBA'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400">Start & End Dates</span>
                <span>{tournament.startDate || 'TBA'} — {tournament.endDate || 'TBA'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400">Registration Deadline</span>
                <span>{tournament.registrationDeadline || 'TBA'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-400">Age & Gender Category</span>
                <span>{tournament.ageGroup || 'Open'} / {tournament.genderCategory || 'All'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-400">Organizer Contact</span>
                <span className="font-bold text-blue-500">{tournament.organizerName}</span>
              </div>
            </div>
          </Card>

          <Card title="Offline Operations Guide" subtitle="How this tournament functions">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <p>1. <strong>Offline Entry:</strong> Players apply directly with you offline. There are no online application queues.</p>
              <p>2. <strong>Squad Roster:</strong> Register participating teams and link registered players to each squad in the <em>Teams & Squad Lineups</em> tab.</p>
              <p>3. <strong>Match Fixtures:</strong> Schedule match ties and certify official scorelines in the <em>Fixtures & Scores</em> tab.</p>
              <p>4. <strong>Player Stats & GPI:</strong> Feed match data and individual statistics in the <em>Player Stats & GPI Engine</em> tab. Every entry or edit triggers instant GPI recalculation.</p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: TEAMS & LINEUPS */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Registered Teams & Squads</h3>
              <p className="text-xs text-slate-400">Create teams and attach participating players to team rosters</p>
            </div>
            <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowTeamModal(true)}>
              Register Team
            </Button>
          </div>

          {teams.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Shield className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No teams registered yet</p>
              <p className="text-xs text-slate-400 mt-1">Register participating clubs to build fixtures and player squads.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-blue-900/40 p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                        <Shield className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white">{team.name}</h4>
                    </div>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      onClick={() => { setSelectedTeamId(team.id); setShowAddMemberModal(true); }}
                    >
                      + Add Player
                    </Button>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Squad Lineup ({team.members?.length || 0})
                    </span>
                    {(!team.members || team.members.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No players added to squad yet.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {team.members.map((m) => (
                          <div key={m.id} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{m.playerName || m.name}</span>
                            <button
                              onClick={() => handleRemoveTeamMember(team.id, m.playerId)}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                              title="Remove from squad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FIXTURES & SCORES */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tournament Match Fixtures</h3>
              <p className="text-xs text-slate-400">Schedule ties between teams and record official scores</p>
            </div>
            <Button 
              size="sm" 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />} 
              onClick={() => setShowMatchModal(true)}
              disabled={teams.length < 2}
            >
              Add Fixture
            </Button>
          </div>

          {teams.length < 2 && (
            <Alert type="info" message="Please register at least 2 teams before scheduling match fixtures." />
          )}

          {matches.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <FootballIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No match fixtures scheduled</p>
              <p className="text-xs text-slate-400 mt-1">Schedule games to feed official match results.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Fixture</th>
                    <th className="px-5 py-3.5">Date & Venue</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Scoreline</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matches.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        <span className="text-blue-500">{m.homeTeamName || 'TBD'}</span>
                        <span className="text-slate-400 mx-2">vs</span>
                        <span className="text-blue-500">{m.awayTeamName || 'TBD'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        <div>{m.matchDateTime ? new Date(m.matchDateTime).toLocaleString() : 'TBD'}</div>
                        <div className="text-[11px] text-slate-400">{m.venue || 'Stadium'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-5 py-3.5 font-black text-base stat-number text-slate-900 dark:text-white">
                        {m.status === 'COMPLETED' ? `${m.homeScore ?? 0} - ${m.awayScore ?? 0}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button 
                          size="xs" 
                          variant="outline"
                          onClick={() => {
                            setSelectedMatch(m);
                            setScoreForm({ homeScore: m.homeScore || 0, awayScore: m.awayScore || 0 });
                            setShowScoreModal(true);
                          }}
                        >
                          {m.status === 'COMPLETED' ? 'Edit Score' : 'Enter Score'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLAYER STATS & GPI ENGINE FEED */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Player Match Statistics & GPI Feed</h3>
              <p className="text-xs text-slate-400">Enter per-player statistics required by the GPI calculation engine. Saving or deleting immediately recalculates player GPI.</p>
            </div>
            <Button 
              size="sm" 
              variant="primary" 
              icon={<Plus className="w-4 h-4" />} 
              onClick={() => { setStatsForm(initialStatsForm); setShowStatsModal(true); }}
            >
              Add Player Stats
            </Button>
          </div>

          {stats.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BarChart3 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No player statistics entered yet</p>
              <p className="text-xs text-slate-400 mt-1">Add participating player stats to populate leaderboards and scout GPI ratings.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Mins</th>
                    <th className="px-4 py-3">Goals</th>
                    <th className="px-4 py-3">Assists</th>
                    <th className="px-4 py-3">Shots (OT)</th>
                    <th className="px-4 py-3">Passes</th>
                    <th className="px-4 py-3">Key Pass</th>
                    <th className="px-4 py-3">Dribbles</th>
                    <th className="px-4 py-3">Tackles</th>
                    <th className="px-4 py-3">Duels</th>
                    <th className="px-4 py-3">Cards</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {s.playerName || s.playerUsername}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{s.teamName || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-500">{s.position}</span>
                      </td>
                      <td className="px-4 py-3">{s.minutesPlayed}'</td>
                      <td className="px-4 py-3 font-bold text-emerald-500">{s.goals}</td>
                      <td className="px-4 py-3 font-bold text-blue-500">{s.assists}</td>
                      <td className="px-4 py-3">{s.shots} ({s.shotsOnTarget})</td>
                      <td className="px-4 py-3">{s.passesCompleted}/{s.passesAttempted}</td>
                      <td className="px-4 py-3">{s.keyPasses}</td>
                      <td className="px-4 py-3">{s.dribblesCompleted}/{s.dribblesAttempted}</td>
                      <td className="px-4 py-3">{s.tackles}</td>
                      <td className="px-4 py-3">{s.duelsWon}</td>
                      <td className="px-4 py-3">
                        {s.yellowCards > 0 && <span className="text-amber-500 font-bold mr-1">{s.yellowCards}Y</span>}
                        {s.redCards > 0 && <span className="text-rose-500 font-bold">{s.redCards}R</span>}
                        {s.yellowCards === 0 && s.redCards === 0 && '—'}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditStats(s)}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit stats"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStats(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete stats"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: STATUS UPDATE */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Tournament Lifecycle">
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Advance tournament status through its official operational stages.</p>
          <div className="space-y-2">
            {['DRAFT', 'OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setNewStatus(st)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all ${
                  newStatus === st 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleStatusUpdate}>Confirm Status</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: CREATE TEAM */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Register Team for Tournament">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <FormInput
            label="Club / Team Name *"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Thunder FC"
            required
          />
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Team</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: ADD MEMBER TO SQUAD */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add Player to Squad Lineup">
        <form onSubmit={handleAddTeamMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Registered Players
            </label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Type username to search..."
                value={playerSearchQuery}
                onChange={(e) => {
                  setPlayerSearchQuery(e.target.value);
                  loadPlayers(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-semibold"
              required
            >
              <option value="">Select a player...</option>
              {playersList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.username} ({p.username}) - {p.position || 'CM'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddMemberModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!selectedPlayerId}>Add to Squad</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: CREATE FIXTURE */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} title="Schedule Match Fixture">
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Home Team *</label>
              <select
                value={matchForm.homeTeamId}
                onChange={(e) => setMatchForm({ ...matchForm, homeTeamId: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                required
              >
                <option value="">Select Home Club</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Away Team *</label>
              <select
                value={matchForm.awayTeamId}
                onChange={(e) => setMatchForm({ ...matchForm, awayTeamId: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                required
              >
                <option value="">Select Away Club</option>
                {teams.filter(t => String(t.id) !== String(matchForm.homeTeamId)).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            type="datetime-local"
            label="Match Date & Kickoff Time"
            value={matchForm.matchDateTime}
            onChange={(e) => setMatchForm({ ...matchForm, matchDateTime: e.target.value })}
          />

          <FormInput
            label="Stadium Pitch / Venue"
            value={matchForm.venue}
            onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
            placeholder={tournament.venue || 'Stadium'}
          />

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowMatchModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Schedule Fixture</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: ENTER SCORE */}
      <Modal isOpen={showScoreModal} onClose={() => setShowScoreModal(false)} title="Certify Final Match Scoreline">
        <form onSubmit={handleUpdateScore} className="space-y-4">
          <div className="flex items-center justify-center space-x-4 py-4">
            <div className="text-center">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                {selectedMatch?.homeTeamName || 'Home'}
              </label>
              <input
                type="number"
                min="0"
                value={scoreForm.homeScore}
                onChange={(e) => setScoreForm({ ...scoreForm, homeScore: parseInt(e.target.value) || 0 })}
                className="w-20 text-center text-2xl font-black p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>
            <span className="text-xl font-black text-slate-400">—</span>
            <div className="text-center">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                {selectedMatch?.awayTeamName || 'Away'}
              </label>
              <input
                type="number"
                min="0"
                value={scoreForm.awayScore}
                onChange={(e) => setScoreForm({ ...scoreForm, awayScore: parseInt(e.target.value) || 0 })}
                className="w-20 text-center text-2xl font-black p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowScoreModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Certify Score</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 6: ENTER / EDIT PLAYER STATS (GPI ENGINE) */}
      <Modal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
        title={statsForm.id ? "Edit Player Tournament Stats" : "Feed Player Tournament Stats (GPI Calculation)"}
      >
        <form onSubmit={handleSaveStats} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Player *</label>
              <select
                value={statsForm.playerId}
                onChange={(e) => setStatsForm({ ...statsForm, playerId: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-semibold"
                required
                disabled={!!statsForm.id}
              >
                <option value="">Select registered player...</option>
                {playersList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name || p.username} ({p.username})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Team Squad</label>
              <select
                value={statsForm.teamId}
                onChange={(e) => setStatsForm({ ...statsForm, teamId: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              >
                <option value="">Select team (optional)...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Position *</label>
              <select
                value={statsForm.position}
                onChange={(e) => setStatsForm({ ...statsForm, position: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold"
              >
                {['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LM', 'RM', 'LB', 'RB', 'CB', 'GK'].map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Match Kind</label>
              <select
                value={statsForm.matchKind}
                onChange={(e) => setStatsForm({ ...statsForm, matchKind: e.target.value })}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              >
                <option value="OFFICIAL">OFFICIAL (Competitive)</option>
                <option value="FRIENDLY">FRIENDLY</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Stars (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={statsForm.stars}
                onChange={(e) => setStatsForm({ ...statsForm, stars: parseInt(e.target.value) || 1 })}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Stats numeric fields */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-[10px] uppercase font-bold text-blue-500 block mb-2">Per-Match Gameplay Statistics</span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Minutes Played', field: 'minutesPlayed', min: 0 },
                { label: 'Goals', field: 'goals', min: 0 },
                { label: 'Assists', field: 'assists', min: 0 },
                { label: 'Shots', field: 'shots', min: 0 },
                { label: 'Shots on Target', field: 'shotsOnTarget', min: 0 },
                { label: 'Passes Attempted', field: 'passesAttempted', min: 0 },
                { label: 'Passes Completed', field: 'passesCompleted', min: 0 },
                { label: 'Key Passes', field: 'keyPasses', min: 0 },
                { label: 'Dribbles Attempted', field: 'dribblesAttempted', min: 0 },
                { label: 'Dribbles Completed', field: 'dribblesCompleted', min: 0 },
                { label: 'Tackles', field: 'tackles', min: 0 },
                { label: 'Interceptions', field: 'interceptions', min: 0 },
                { label: 'Clearances', field: 'clearances', min: 0 },
                { label: 'Duels Won', field: 'duelsWon', min: 0 },
                { label: 'Yellow Cards', field: 'yellowCards', min: 0 },
                { label: 'Red Cards', field: 'redCards', min: 0 }
              ].map(({ label, field, min }) => (
                <div key={field}>
                  <label className="block text-[10px] text-slate-400 font-semibold truncate mb-0.5" title={label}>{label}</label>
                  <input
                    type="number"
                    min={min}
                    value={statsForm[field]}
                    onChange={(e) => setStatsForm({ ...statsForm, [field]: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setShowStatsModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!statsForm.playerId}>
              Save & Recalculate GPI
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTournament;
