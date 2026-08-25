import { apiClient } from './client';

export const getAlerts = async (params?: Record<string, string | number | boolean | undefined>) => {
  const { data } = await apiClient.get('/alerts', { params });
  return data;
};

export const resolveAlert = async (id: number) => {
  const { data } = await apiClient.post(`/alerts/${id}/resolve`);
  return data;
};
