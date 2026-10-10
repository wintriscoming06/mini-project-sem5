import axiosClient from './axiosClient';

export const matchApi = {
  getMatches: (tournamentId) => axiosClient.get('/matches', { params: { tournamentId } }),
  getMatch: (id) => axiosClient.get(`/matches/${id}`),
  createMatch: (data) => axiosClient.post('/matches', data),
  scoreMatch: (id, scoreData) => axiosClient.post(`/matches/${id}/score`, scoreData),
  confirmMatch: (id) => axiosClient.post(`/matches/${id}/confirm`),
  addEvent: (id, eventData) => axiosClient.post(`/matches/${id}/events`, eventData)
};
export default matchApi;
