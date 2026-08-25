import { Router, Request, Response } from 'express';
import { prisma } from '../database/prismaClient';

// ─── Resource routers ────────────────────────────────────────────────────────
import authRoutes from './authRoutes';
import facilityRoutes from './facilityRoutes';
import zoneRoutes from './zoneRoutes';
import slotRoutes from './slotRoutes';
import cameraRoutes from './cameraRoutes';
import gateRoutes from './gateRoutes';
import onboardingRoutes from './onboardingRoutes';
import rawDetectionRoutes from './rawDetectionRoutes';
import adminUserRoutes from './adminUserRoutes';
import userRoutes from './userRoutes';
import vehicleRoutes from './vehicleRoutes';
import detectionRoutes from './detectionRoutes';
import allocationRoutes from './allocationRoutes';
import sessionRoutes from './sessionRoutes';
import alertRoutes from './alertRoutes';
import reportRoutes from './reportRoutes';
import devRoutes from './devRoutes';

const router = Router();

// ─── Unauthenticated health endpoint ─────────────────────────────────────────
router.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: 'error', db: 'unreachable', timestamp: new Date().toISOString() });
  }
});

// ─── API v1 ──────────────────────────────────────────────────────────────────
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/facilities', facilityRoutes);
// Zone nested under facility
router.use('/api/v1/facilities/:facilityId/zones', zoneRoutes);
// Slot nested under zone — plus top-level alias for /slots/:id/status PATCH
router.use('/api/v1/zones/:zoneId/slots', slotRoutes);
router.use('/api/v1/cameras', cameraRoutes);
router.use('/api/v1/onboarding', onboardingRoutes);
router.use('/api/v1/raw-detections', rawDetectionRoutes);
router.use('/api/v1/gates', gateRoutes);
router.use('/api/v1/admin-users', adminUserRoutes);
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/vehicles', vehicleRoutes);
router.use('/api/v1/detections', detectionRoutes);
router.use('/api/v1/allocations', allocationRoutes);
router.use('/api/v1/sessions', sessionRoutes);
router.use('/api/v1/alerts', alertRoutes);
router.use('/api/v1/reports', reportRoutes);

// Dev routes — only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  router.use('/dev/mock', devRoutes);
}

export default router;
