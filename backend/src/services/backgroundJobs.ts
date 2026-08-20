import { prisma } from '../database/prismaClient';
import { SessionService } from './sessionService';
import { AlertService } from './alertService';
import { logger } from '../middleware/requestLogger';

export const startBackgroundJobs = () => {
  logger.info('🕒 Starting background jobs for Session Expiry and Camera Health');

  setInterval(async () => {
    try {
      // 1. Session Expiry
      const expiredCount = await SessionService.expireStaleSessions();
      if (expiredCount > 0) {
        logger.info(`Expired ${expiredCount} stale reserved sessions`);
      }

      // 2. Camera Health (Offline check)
      // Check cameras that have not sent a detection in > 30 seconds
      const timeoutMs = 30000;
      const cutoffTime = new Date(Date.now() - timeoutMs);

      const cameras = await prisma.camera.findMany({
        where: { status: 'ONLINE' },
        include: { detections: { orderBy: { detected_at: 'desc' }, take: 1 } }
      });

      for (const camera of cameras) {
        let isOffline = false;
        
        if (camera.detections.length === 0) {
          // If no detections ever and created before cutoff
          if (camera.created_at < cutoffTime) {
            isOffline = true;
          }
        } else {
          // Has detections, check if the latest one is older than cutoff
          if (camera.detections[0]!.detected_at < cutoffTime) {
            isOffline = true;
          }
        }

        if (isOffline) {
          await prisma.camera.update({
            where: { camera_id: camera.camera_id },
            data: { status: 'OFFLINE' }
          });

          await AlertService.raiseAlert({
            facility_id: camera.facility_id,
            alert_type: 'CAMERA_OFFLINE',
            severity: 'WARNING',
            related_camera_id: camera.camera_id,
            message: `Camera ${camera.camera_id} is offline (no detection in last ${timeoutMs/1000}s)`
          });
          
          logger.warn(`Camera ${camera.camera_id} marked OFFLINE`);
        }
      }
    } catch (err) {
      logger.error('Error running background jobs:', err);
    }
  }, 10000); // run every 10s for quick resolution in tests
};
