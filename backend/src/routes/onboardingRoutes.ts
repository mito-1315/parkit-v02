import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { validateRequest } from '../middleware/validateRequest';
import {
  confirmDetectionSchema,
  markDuplicateSchema,
  onboardingCamerasSchema,
  onboardingFacilitySchema,
  onboardingGatesSchema,
  onboardingPricingSchema,
  onboardingZonesSchema,
} from '../validations/onboardingSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();
const adminOnly = [authMiddleware, roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN'])];

router.get('/status', OnboardingController.status);
router.post('/facility', validateRequest(onboardingFacilitySchema), OnboardingController.createFacility);

router.post('/zones', ...adminOnly, validateRequest(onboardingZonesSchema), OnboardingController.createZones);
router.post('/cameras', ...adminOnly, validateRequest(onboardingCamerasSchema), OnboardingController.createCameras);
router.get('/raw-detections', ...adminOnly, OnboardingController.getRawDetections);
router.post('/gates', ...adminOnly, validateRequest(onboardingGatesSchema), OnboardingController.createGates);
router.post('/pricing', ...adminOnly, validateRequest(onboardingPricingSchema), OnboardingController.setPricing);
router.post('/complete', ...adminOnly, OnboardingController.complete);
router.get('/summary', ...adminOnly, OnboardingController.summary);
router.post('/realign-slot-zones', ...adminOnly, OnboardingController.realignSlotZones);

export default router;
