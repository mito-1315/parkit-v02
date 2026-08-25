import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.get('/vehicles', authMiddleware, roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN', 'SECURITY_STAFF']), SessionController.searchVehicles);
router.get('/active', optionalAuthMiddleware, SessionController.getActiveSessions);
router.get('/', optionalAuthMiddleware, SessionController.getHistory);
router.post('/:id/confirm-entry', SessionController.confirmEntry);
router.post('/:id/confirm-exit', SessionController.confirmExit);

export default router;
