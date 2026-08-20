import { apiClient } from './client';

export const getCameras = async () => {
  const { data } = await apiClient.get('/cameras');
  return data;
};

export const createCamera = async (payload: any) => {
  const { data } = await apiClient.post('/cameras', payload);
  return data;
};

export const updateCamera = async (id: number, payload: any) => {
  const { data } = await apiClient.put(`/cameras/${id}`, payload);
  return data;
};

export const deleteCamera = async (id: number) => {
  const { data } = await apiClient.delete(`/cameras/${id}`);
  return data;
};

export const captureEmptyLot = async (id: number) => {
  const { data } = await apiClient.post(`/cameras/${id}/capture-empty-lot`);
  return data;
};

export const extractBoxes = async (id: number) => {
  const { data } = await apiClient.post(`/cameras/${id}/extract-boxes`);
  return data;
};
