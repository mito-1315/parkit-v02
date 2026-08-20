import { apiClient } from './client';

export const getOnboardingStatus = async () => {
  const { data } = await apiClient.get('/onboarding/status');
  return data as {
    hasFacility: boolean;
    hasAdmin: boolean;
    onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | null;
    onboardingStep: number;
    facilityId: number | null;
  };
};

export const createOnboardingFacility = async (payload: any) => {
  const { data } = await apiClient.post('/onboarding/facility', payload);
  return data;
};

export const createOnboardingZones = async (zones: any[]) => {
  const { data } = await apiClient.post('/onboarding/zones', { zones });
  return data;
};

export const createOnboardingCameras = async (cameras: any[]) => {
  const { data } = await apiClient.post('/onboarding/cameras', { cameras });
  return data;
};

export const captureEmptyLot = async (cameraId: number) => {
  const { data } = await apiClient.post(`/cameras/${cameraId}/capture-empty-lot`);
  return data;
};

export const extractBoxes = async (cameraId: number) => {
  const { data } = await apiClient.post(`/cameras/${cameraId}/extract-boxes`);
  return data;
};

export const getRawDetections = async (status?: string) => {
  const { data } = await apiClient.get('/onboarding/raw-detections', { params: status ? { status } : {} });
  return data;
};

export const rejectDetection = async (id: number) => {
  const { data } = await apiClient.post(`/raw-detections/${id}/reject`);
  return data;
};

export const markDuplicateDetection = async (id: number, duplicateOfId: number) => {
  const { data } = await apiClient.post(`/raw-detections/${id}/mark-duplicate`, { duplicateOfId });
  return data;
};

export const confirmDetection = async (
  id: number,
  payload: { slotCode: string; zoneId: number; slotType: string },
) => {
  const { data } = await apiClient.post(`/raw-detections/${id}/confirm`, payload);
  return data;
};

export const createOnboardingGates = async (gates: any[]) => {
  const { data } = await apiClient.post('/onboarding/gates', { gates });
  return data;
};

export const setOnboardingPricing = async (payload: any) => {
  const { data } = await apiClient.post('/onboarding/pricing', payload);
  return data;
};

export const completeOnboarding = async () => {
  const { data } = await apiClient.post('/onboarding/complete');
  return data;
};

export const getOnboardingSummary = async () => {
  const { data } = await apiClient.get('/onboarding/summary');
  return data;
};

export const realignSlotZones = async () => {
  const { data } = await apiClient.post('/onboarding/realign-slot-zones');
  return data as { fixed: number; total: number };
};

export function imageUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:4000${path}`;
}
