import axiosClient from './axiosClient';

export const tournamentApi = {
  getTournaments: () => axiosClient.get('/tournaments'),
  getTournament: (id) => axiosClient.get(`/tournaments/${id}`),
  createTournament: (data) => axiosClient.post('/tournaments', data),
  updateTournament: (id, data) => axiosClient.put(`/tournaments/${id}`, data),
  getMyTournaments: () => axiosClient.get('/tournaments/organizer/me')
};
export default tournamentApi;
