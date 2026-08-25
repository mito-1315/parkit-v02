import { apiClient } from './client';

export const getFacilities = async () => {
  const { data } = await apiClient.get('/facilities');
  return data;
};

export const getFacility = async (id: number) => {
  const { data } = await apiClient.get(`/facilities/${id}`);
  return data;
};

export const getZones = async (facilityId: number) => {
  const { data } = await apiClient.get(`/facilities/${facilityId}/zones`);
  return data;
};

export const getFacilitySlots = async (facilityId: number) => {
  const { data } = await apiClient.get(`/facilities/${facilityId}/slots`);
  return data;
};

export const createFacility = async (payload: any) => {
  const { data } = await apiClient.post('/facilities', payload);
  return data;
};

export const updateFacility = async (id: number, payload: any) => {
  const { data } = await apiClient.put(`/facilities/${id}`, payload);
  return data;
};

export const createZone = async (facilityId: number, payload: any) => {
  const { data } = await apiClient.post(`/facilities/${facilityId}/zones`, payload);
  return data;
};

export const updateZone = async (facilityId: number, zoneId: number, payload: any) => {
  const { data } = await apiClient.put(`/facilities/${facilityId}/zones/${zoneId}`, payload);
  return data;
};

export const deleteFacility = async (facilityId: number) => {
  const { data } = await apiClient.delete(`/facilities/${facilityId}`);
  return data;
};

export const deleteZone = async (facilityId: number, zoneId: number) => {
  const { data } = await apiClient.delete(`/facilities/${facilityId}/zones/${zoneId}`);
  return data;
};
