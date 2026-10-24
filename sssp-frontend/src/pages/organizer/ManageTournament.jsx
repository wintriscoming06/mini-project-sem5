import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { 
  ArrowLeft, Plus, Shield, Users, BarChart3, 
  Trash2, Edit3, Calendar, MapPin, Search, CheckCircle2, Award
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
  const [allRegisteredPlayers, setAllRegisteredPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [certifying, setCertifying] = useState(false);
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
    matchId: null,
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
    { id: 'matches', label: 'Fixtures & Scores', icon: FootballIcon }
  ];

  useEffect(() => {
    fetchTournament();
    loadRegisteredPlayers();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'teams') fetchTeams();
    if (activeTab === 'matches') {
      fetchMatches();
      fetchTeams();
      fetchStats();
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

  const loadRegisteredPlayers = async (q = '') => {
    try {
      const res = await tournamentService.searchPlayers(q);
      setAllRegisteredPlayers(res.data || []);
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
      setSuccess('Player added to squad lineup');
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

  const handleSaveScoreDraft = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    try {
      setError(null);
      await tournamentService.updateMatchScore(id, selectedMatch.id, scoreForm);
      setSuccess('Scoreline draft saved.');
      fetchMatches();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save score');
    }
  };

  const handleCertifyMatch = async () => {
    if (!selectedMatch) return;
    try {
      setCertifying(true);
      setError(null);
      // Ensure current score form is saved first
      await tournamentService.updateMatchScore(id, selectedMatch.id, scoreForm);
      // Certify match: locks score and triggers GPI recalculation
      const res = await tournamentService.certifyMatch(id, selectedMatch.id);
      setSelectedMatch(res.data);
      setSuccess('Official Match Certification Complete! GPI engine has recalculated ratings for all players, and match statistics are published.');
      fetchMatches();
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to certify match');
    } finally {
      setCertifying(false);
    }
  };

  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await tournamentService.savePlayerStats(id, {
        ...statsForm,
        matchId: selectedMatch?.id
      });
      setShowStatsModal(false);
      setStatsForm(initialStatsForm);
      setSuccess('Player performance stats saved successfully.');
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save stats');
    }
  };

  const handleDeleteStats = async (statsId) => {
    if (!window.confirm('Delete this player stats entry?')) return;
    try {
      setError(null);
      await tournamentService.deletePlayerStats(id, statsId);
      setSuccess('Stats entry deleted.');
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete stats');
    }
  };

  // Helper: Get players participating in the selected match's teams
  const getMatchEligiblePlayers = () => {
    if (!selectedMatch) return [];
    const homeTeam = teams.find(t => t.id === selectedMatch.homeTeamId);
    const awayTeam = teams.find(t => t.id === selectedMatch.awayTeamId);

    const eligible = [];
    if (homeTeam && homeTeam.members) {
      homeTeam.members.forEach(m => {
        eligible.push({
          playerId: m.playerId,
          username: m.playerName || m.name,
          teamId: homeTeam.id,
          teamName: homeTeam.name
        });
      });
    }
    if (awayTeam && awayTeam.members) {
      awayTeam.members.forEach(m => {
        eligible.push({
          playerId: m.playerId,
          username: m.playerName || m.name,
          teamId: awayTeam.id,
          teamName: awayTeam.name
        });
      });
    }
    return eligible;
  };

  const openAddStatsForMatch = () => {
    const eligible = getMatchEligiblePlayers();
    setStatsForm({
      ...initialStatsForm,
      matchId: selectedMatch?.id,
      teamId: selectedMatch?.homeTeamId || '',
      playerId: eligible.length > 0 ? eligible[0].playerId : ''
    });
    setShowStatsModal(true);
  };

  const openEditStats = (item) => {
    setStatsForm({
      id: item.id,
      matchId: item.matchId || selectedMatch?.id,
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
      {/* Top Bar */}
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
                <span className="font-semibold text-slate-400">Age & Gender Category</span>
                <span>{tournament.ageGroup || 'Open'} / {tournament.genderCategory || 'All'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-slate-400">Organizer Contact</span>
                <span className="font-bold text-blue-500">{tournament.organizerName}</span>
              </div>
            </div>
          </Card>

          <Card title="How It Works" subtitle="Offline workflow summary">
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <p>1. <strong>Offline Registration:</strong> Players apply directly with you offline. No online application queues exist.</p>
              <p>2. <strong>Squad Lineups:</strong> Register your tournament teams in <em>Teams & Squad Lineups</em> and assign signed-up players to each squad by their unique username.</p>
              <p>3. <strong>Data Feed & Official Certification:</strong> In <em>Fixtures & Scores</em>, schedule matches between teams and click <strong>"Edit Score & Players Data"</strong>. Enter match scores and player performances, then hit <strong>"Certify Match & Recalculate GPI"</strong> to officially lock results and update player ratings.</p>
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
              <p className="text-xs text-slate-400">Create participating teams and assign registered players to team rosters</p>
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
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {m.playerName || m.name}
                            </span>
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

      {/* TAB 3: FIXTURES & SCORES (WITH EMBEDDED PLAYER STATS FEED) */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Tournament Match Fixtures</h3>
              <p className="text-xs text-slate-400">Schedule ties between teams and click "Edit Score & Players Data" to feed match results, save stats, and certify official match results.</p>
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
              <p className="text-xs text-slate-400 mt-1">Schedule games to feed official match results and player stats.</p>
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
                        <StatusBadge 
                          status={m.confirmed ? 'COMPLETED' : m.status} 
                          label={m.confirmed ? 'CERTIFIED' : m.status} 
                        />
                      </td>
                      <td className="px-5 py-3.5 font-black text-base stat-number text-slate-900 dark:text-white">
                        {m.homeScore != null && m.awayScore != null ? `${m.homeScore} - ${m.awayScore}` : '—'}
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
                          {m.confirmed ? 'View Certified Match Data' : 'Edit Score & Players Data'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OVERVIEW TABLE OF ALL RECORDED PLAYER STATS IN THIS TOURNAMENT */}
          {stats.length > 0 && (
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Recorded Tournament Player Stats ({stats.length})
                </h4>
                <span className="text-[11px] text-slate-400">GPI recalculation completes when matches are certified</span>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Player (Username)</th>
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
                      <th className="px-4 py-3">Cards</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {s.playerUsername || s.playerName}
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

      {/* MODAL 3: ADD MEMBER TO SQUAD (Username displayed) */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add Player to Squad Lineup">
        <form onSubmit={handleAddTeamMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Search Registered Players by Username
            </label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Type username to search..."
                value={playerSearchQuery}
                onChange={(e) => {
                  setPlayerSearchQuery(e.target.value);
                  loadRegisteredPlayers(e.target.value);
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
              <option value="">Select player by username...</option>
              {allRegisteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.username}
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

      {/* MODAL 5: EDIT SCORE, FEED PLAYERS DATA & CERTIFY MATCH */}
      <Modal 
        isOpen={showScoreModal} 
        onClose={() => setShowScoreModal(false)} 
        title={`Match Operations: ${selectedMatch?.homeTeamName || 'Home'} vs ${selectedMatch?.awayTeamName || 'Away'}`}
      >
        <div className="space-y-6">
          {/* Status banner */}
          {selectedMatch?.confirmed ? (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Certified Official Match. Results and player GPI calculations are certified and published.</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>Enter match score and squad player statistics, then certify the match to trigger GPI recalculation.</span>
            </div>
          )}

          {/* Scoreline */}
          <form onSubmit={handleSaveScoreDraft} className="space-y-4">
            <div className="flex items-center justify-center space-x-6 py-1">
              <div className="text-center">
                <label className="block text-xs font-extrabold text-blue-500 mb-1">
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
              <span className="text-2xl font-black text-slate-400">—</span>
              <div className="text-center">
                <label className="block text-xs font-extrabold text-blue-500 mb-1">
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
            <div className="flex justify-center">
              <Button variant="outline" size="xs" type="submit">
                Save Score Draft
              </Button>
            </div>
          </form>

          {/* SQUAD PLAYERS DATA FEED FOR THIS FIXTURE */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Fixture Squad Players ({getMatchEligiblePlayers().length})
                </h4>
                <p className="text-[11px] text-slate-400">Add or edit individual performances before certifying</p>
              </div>
              <Button 
                size="xs" 
                variant="primary" 
                icon={<Plus className="w-3.5 h-3.5" />} 
                onClick={openAddStatsForMatch}
                disabled={getMatchEligiblePlayers().length === 0}
              >
                Add Player Performance
              </Button>
            </div>

            {getMatchEligiblePlayers().length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                Neither team has players added to its squad lineup yet. Go to <strong>Teams & Squad Lineups</strong> to assign players to these teams first.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getMatchEligiblePlayers().map(p => {
                  const playerStat = stats.find(s => s.playerId === p.playerId);
                  return (
                    <div key={`${p.teamId}-${p.playerId}`} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 dark:text-white mr-2">{p.username}</span>
                        <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {p.teamName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {playerStat ? (
                          <>
                            <span className="text-[11px] font-bold text-emerald-500">
                              Stats Saved ({playerStat.goals}G, {playerStat.assists}A, {playerStat.minutesPlayed}')
                            </span>
                            <Button size="xs" variant="outline" onClick={() => openEditStats(playerStat)}>
                              Edit Data
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="xs" 
                            variant="primary" 
                            onClick={() => {
                              setStatsForm({
                                ...initialStatsForm,
                                matchId: selectedMatch?.id,
                                teamId: p.teamId,
                                playerId: p.playerId
                              });
                              setShowStatsModal(true);
                            }}
                          >
                            + Enter Data
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FINAL CERTIFICATION ACTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Official Certification & GPI Recalculation</h5>
              <p className="text-[11px] text-slate-400">Lock the scoreline and trigger the GPI engine to update all player ratings.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCertifyMatch}
              disabled={certifying}
              icon={<Award className="w-4 h-4 mr-1" />}
            >
              {certifying ? 'Certifying...' : selectedMatch?.confirmed ? 'Re-Certify & Recalculate GPI' : 'Certify Match & Recalculate GPI'}
            </Button>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setShowScoreModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: ENTER / EDIT PLAYER STATS (Filtered to this match fixture's teams) */}
      <Modal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
        title={statsForm.id ? "Edit Player Performance Data" : "Add Player Performance Data"}
      >
        <form onSubmit={handleSaveStats} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Player Username *</label>
              <select
                value={statsForm.playerId}
                onChange={(e) => {
                  const pid = e.target.value;
                  const found = getMatchEligiblePlayers().find(p => String(p.playerId) === String(pid));
                  setStatsForm({ 
                    ...statsForm, 
                    playerId: pid,
                    teamId: found ? found.teamId : statsForm.teamId 
                  });
                }}
                className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold"
                required
                disabled={!!statsForm.id}
              >
                <option value="">Select player username...</option>
                {getMatchEligiblePlayers().map((p) => (
                  <option key={p.playerId} value={p.playerId}>
                    {p.username} ({p.teamName})
                  </option>
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
                <option value="">Select team...</option>
                {teams.filter(t => t.id === selectedMatch?.homeTeamId || t.id === selectedMatch?.awayTeamId).map((t) => (
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
            <span className="text-[10px] uppercase font-bold text-blue-500 block mb-2">Gameplay Statistics</span>
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
              Save Performance Data
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTournament;
