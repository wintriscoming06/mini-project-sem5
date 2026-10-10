import axiosClient from './axiosClient';

export const correctionApi = {
  getCorrections: () => axiosClient.get('/corrections'),
  submitCorrection: (data) => axiosClient.post('/corrections', data),
  decideCorrection: (id, status, comments) => axiosClient.put(`/corrections/${id}`, { status, comments })
};
export default correctionApi;
