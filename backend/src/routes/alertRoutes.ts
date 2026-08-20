import { Router } from 'express';
import { AlertController } from '../controllers/alertController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', AlertController.getAlerts);
// Needs auth to resolve
router.post('/:id/resolve', optionalAuthMiddleware, AlertController.resolveAlert);

export default router;
