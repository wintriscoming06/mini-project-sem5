import axiosClient from './axiosClient';

export const adminApi = {
  getUsers: () => axiosClient.get('/admin/users'),
  updateUserRole: (userId, role) => axiosClient.put(`/admin/users/${userId}/role`, { role }),
  getAuditLogs: () => axiosClient.get('/admin/audit-logs'),
  getGpiConfig: () => axiosClient.get('/admin/gpi-config'),
  updateGpiConfig: (config) => axiosClient.put('/admin/gpi-config', config)
};
export default adminApi;
