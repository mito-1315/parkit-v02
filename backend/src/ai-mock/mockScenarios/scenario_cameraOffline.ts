/* eslint-disable no-console */
/**
 * Scenario: Camera Offline
 *
 * Stops producing Detection rows for a given camera for a configurable duration.
 * This is used by Phase 5 tests to trigger the "no detections for N seconds" alert.
 */
export const offlineCameras = new Set<number>();

export function runCameraOffline(cameraId: number, durationMs = 60_000) {
  offlineCameras.add(cameraId);
  console.log(`[scenario_cameraOffline] Camera ${cameraId} is now offline for ${durationMs}ms`);

  setTimeout(() => {
    offlineCameras.delete(cameraId);
    console.log(`[scenario_cameraOffline] Camera ${cameraId} is back online`);
  }, durationMs);

  return { cameraId, offlineUntil: new Date(Date.now() + durationMs).toISOString() };
}

/** Check if a camera is currently simulated-offline */
export function isCameraOffline(cameraId: number): boolean {
  return offlineCameras.has(cameraId);
}
