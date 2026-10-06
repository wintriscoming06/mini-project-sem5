import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sssp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = (error.config?.url || '').startsWith('/auth/');
    if (error.response && error.response.status === 401 && !isAuthCall) {
      localStorage.removeItem('sssp_token');
      localStorage.removeItem('sssp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Extracts the real message sent by the backend (ErrorResponse.message / .errors),
// instead of axios' generic "Request failed with status code NNN".
export const getErrorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  const data = err?.response?.data;
  if (data) {
    if (data.errors && typeof data.errors === 'object' && Object.keys(data.errors).length) {
      return Object.entries(data.errors).map(([f, m]) => `${f}: ${m}`).join('; ');
    }
    if (data.message) return data.message;
  }
  if (err?.request && !err.response) {
    return 'Cannot reach the server at http://localhost:8080. Is the backend running?';
  }
  return err?.message || fallback;
};

export default api;

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

// Player endpoints. Called with no argument they target the authenticated player (/players/me, identity
// taken from the JWT on the server); called with an id (scouts viewing/comparing players) they target that user.
const playerPath = (id) => (id === undefined || id === null ? '/players/me' : `/players/${id}`);

export const playerService = {
  getProfile: (id) => api.get(playerPath(id)),
  updateProfile: (data, id) => api.put(playerPath(id), data),
  getPerformance: (id) => api.get(`${playerPath(id)}/performance`),
  getGPI: (id) => api.get(`${playerPath(id)}/gpi`),
  getRanking: (id) => api.get(`${playerPath(id)}/ranking`),
  getMatchStats: (id) => api.get(`${playerPath(id)}/match-stats`)
};

export const tournamentService = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tournaments/${id}/status`, { status }),
  getApplications: (id) => api.get(`/tournaments/${id}/applications`),
  apply: (id) => api.post(`/tournaments/${id}/applications`),
  getMyApplications: () => api.get('/tournaments/my-applications'),
  decideApplication: (appId, decision) => api.patch(`/applications/${appId}`, { decision }),
  getTeams: (tournamentId) => api.get(`/tournaments/${tournamentId}/teams`),
  createTeam: (data) => api.post('/teams', data),
  addTeamMember: (teamId, data) => api.post(`/teams/${teamId}/members`, data),
  removeTeamMember: (teamId, playerId) => api.delete(`/teams/${teamId}/members/${playerId}`)
};

export const matchService = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  updateStatus: (id, status) => api.patch(`/matches/${id}/status`, { status }),
  addEvent: (id, data) => api.post(`/matches/${id}/events`, data),
  getEvents: (id) => api.get(`/matches/${id}/events`),
  addParticipation: (id, data) => api.post(`/matches/${id}/participations`, data),
  getParticipations: (id) => api.get(`/matches/${id}/participations`),
  confirm: (id, data) => api.post(`/matches/${id}/confirm`, data),
  submitCorrection: (id, data) => api.post(`/matches/${id}/corrections`, data),
  getMatchStats: (id) => api.get(`/matches/${id}/stats`)
};

export const scoutService = {
  searchPlayers: (params) => api.get('/scouts/players/search', { params }),
  getShortlist: () => api.get('/scouts/shortlist'),
  addToShortlist: (playerId, data) => api.post(`/scouts/players/${playerId}/shortlist`, data),
  removeFromShortlist: (playerId) => api.delete(`/scouts/players/${playerId}/shortlist`),
  getAlerts: () => api.get('/scouts/alerts'),
  markAlertRead: (id) => api.patch(`/scouts/alerts/${id}/read`),
  saveFilter: (data) => api.post('/scouts/filters', data),
  getFilters: () => api.get('/scouts/filters'),
  deleteFilter: (id) => api.delete(`/scouts/filters/${id}`),
  submitObservation: (playerId, data) => api.post(`/scouts/players/${playerId}/observations`, data),
  getObservations: (playerId) => api.get(`/scouts/players/${playerId}/observations`),
  addNote: (playerId, data) => api.post(`/scouts/players/${playerId}/notes`, data),
  getNotes: (playerId) => api.get(`/scouts/players/${playerId}/notes`)
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getCorrections: () => api.get('/admin/corrections'),
  decideCorrection: (id, decision) => api.patch(`/admin/corrections/${id}`, { decision }),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getGPIConfig: () => api.get('/admin/gpi-config'),
  updateGPIConfig: (data) => api.put('/admin/gpi-config', data)
};

export const rankingService = {
  getByContext: (context) => api.get('/rankings', { params: { context } }),
  getContexts: () => api.get('/rankings/contexts')
};
