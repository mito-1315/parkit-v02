import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN', 'SECURITY_STAFF']));

router.get('/', ReportController.getDaily);

export default router;
