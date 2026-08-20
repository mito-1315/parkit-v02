import { apiClient } from './client';

export const getSlots = async (zoneId: number) => {
  const { data } = await apiClient.get(`/zones/${zoneId}/slots`);
  return data;
};

export const createSlot = async (zoneId: number, payload: any) => {
  const { data } = await apiClient.post(`/zones/${zoneId}/slots`, payload);
  return data;
};

export const updateSlot = async (zoneId: number, slotId: number, payload: any) => {
  const { data } = await apiClient.put(`/zones/${zoneId}/slots/${slotId}`, payload);
  return data;
};

export const generateSlots = async (zoneId: number, payload: { count: number; slot_type?: string; prefix?: string }) => {
  const { data } = await apiClient.post(`/zones/${zoneId}/slots/bulk`, payload);
  return data;
};

export const deleteSlot = async (zoneId: number, slotId: number) => {
  const { data } = await apiClient.delete(`/zones/${zoneId}/slots/${slotId}`);
  return data;
};
