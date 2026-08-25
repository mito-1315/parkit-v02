import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { validateRequest } from '../middleware/validateRequest';
import { confirmDetectionSchema, markDuplicateSchema } from '../validations/onboardingSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.post('/:id/reject', OnboardingController.rejectDetection);
router.post('/:id/mark-duplicate', validateRequest(markDuplicateSchema), OnboardingController.markDuplicate);
router.post('/:id/confirm', validateRequest(confirmDetectionSchema), OnboardingController.confirmDetection);

export default router;
