import { apiClient } from './client';

export const getGates = async () => {
  const { data } = await apiClient.get('/gates');
  return data;
};

export const createGate = async (payload: any) => {
  const { data } = await apiClient.post('/gates', payload);
  return data;
};

export const updateGate = async (id: number, payload: any) => {
  const { data } = await apiClient.put(`/gates/${id}`, payload);
  return data;
};

export const regenerateGateQr = async (id: number) => {
  const { data } = await apiClient.post(`/gates/${id}/regenerate-qr`);
  return data;
};

export const deleteGate = async (id: number) => {
  const { data } = await apiClient.delete(`/gates/${id}`);
  return data;
};
