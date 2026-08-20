import { Router } from 'express';
import { DetectionController } from '../controllers/detectionController';
import { validateRequest } from '../middleware/validateRequest';
import { createDetectionSchema } from '../validations/detectionSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// GET is admin-only (for debugging); POST is the AI ingest endpoint
router.get('/', authMiddleware, roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN', 'SECURITY_STAFF']), DetectionController.getAll);
router.post('/', validateRequest(createDetectionSchema), DetectionController.create);

export default router;
