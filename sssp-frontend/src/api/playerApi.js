import axiosClient from './axiosClient';

export const playerApi = {
  getProfile: (id) => axiosClient.get(id ? `/players/${id}` : '/players/me'),
  updateProfile: (data) => axiosClient.put('/players/me', data),
  getGPI: (id) => axiosClient.get(id ? `/gpi/players/${id}` : '/gpi/me'),
  getMatchStats: (id) => axiosClient.get(id ? `/stats/players/${id}/matches` : '/stats/me/matches'),
  getRanking: (id) => axiosClient.get(id ? `/rankings/players/${id}` : '/rankings/me')
};
export default playerApi;
