import axiosClient from './axiosClient';

export const scoutApi = {
  searchPlayers: (criteria) => axiosClient.post('/scout/search', criteria),
  getShortlist: () => axiosClient.get('/scout/shortlist'),
  addToShortlist: (playerId, notes) => axiosClient.post('/scout/shortlist', { playerId, notes }),
  removeFromShortlist: (playerId) => axiosClient.delete(`/scout/shortlist/${playerId}`),
  getObservations: (playerId) => axiosClient.get(`/scout/observations/${playerId}`),
  submitObservation: (playerId, obs) => axiosClient.post(`/scout/observations/${playerId}`, obs),
  getNotes: (playerId) => axiosClient.get(`/scout/notes/${playerId}`),
  addNote: (playerId, content) => axiosClient.post(`/scout/notes/${playerId}`, { content }),
  getAlerts: () => axiosClient.get('/scout/alerts'),
  getFilters: () => axiosClient.get('/scout/filters'),
  saveFilter: (filterData) => axiosClient.post('/scout/filters', filterData)
};
export default scoutApi;
