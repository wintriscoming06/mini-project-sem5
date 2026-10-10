import axiosClient from './axiosClient';

export const applicationApi = {
  applyToTournament: (data) => axiosClient.post('/applications', data),
  getMyApplications: () => axiosClient.get('/applications/me'),
  getTournamentApplications: (tournamentId) => axiosClient.get(`/applications/tournament/${tournamentId}`),
  decideApplication: (id, decision) => axiosClient.put(`/applications/${id}/decision`, { decision })
};
export default applicationApi;
