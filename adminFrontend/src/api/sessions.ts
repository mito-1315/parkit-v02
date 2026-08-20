import { apiClient } from './client';

export const getSessions = async () => {
  const { data } = await apiClient.get('/sessions');
  return data;
};

export const getActiveSessions = async (facilityId?: number | null) => {
  const { data } = await apiClient.get('/sessions/active', {
    params: facilityId ? { facilityId } : undefined,
  });
  return data;
};

export const confirmEntry = async (sessionId: number) => {
  const { data } = await apiClient.post(`/sessions/${sessionId}/confirm-entry`);
  return data;
};

export const confirmExit = async (sessionId: number, exitGateId: number) => {
  const { data } = await apiClient.post(`/sessions/${sessionId}/confirm-exit`, { exitGateId });
  return data;
};

export const searchVehicles = async (plate: string, facilityId?: number | null) => {
  const { data } = await apiClient.get('/sessions/vehicles', {
    params: { plate, facilityId: facilityId || undefined },
  });
  return data;
};

export const getReports = async (facilityId?: number | null) => {
  const { data } = await apiClient.get('/reports', {
    params: facilityId ? { facilityId } : undefined,
  });
  return data;
};

export const getDetections = async () => {
  const { data } = await apiClient.get('/detections');
  return data;
};
