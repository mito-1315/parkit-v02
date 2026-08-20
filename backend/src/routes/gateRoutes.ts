import { Router } from 'express';
import { GateController } from '../controllers/gateController';
import { GateScanController } from '../controllers/gateScanController';
import { validateRequest } from '../middleware/validateRequest';
import { createGateSchema, updateGateSchema } from '../validations/gateSchema';
import { confirmEntrySchema } from '../validations/onboardingSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.post('/:id/scan-entry', authMiddleware, GateScanController.scanEntry);
router.post('/:id/confirm-entry', authMiddleware, validateRequest(confirmEntrySchema), GateScanController.confirmEntry);
router.post('/:id/scan-exit', authMiddleware, GateScanController.scanExit);

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.get('/', GateController.getAll);
router.get('/:id', GateController.getById);
router.post('/', validateRequest(createGateSchema), GateController.create);
router.put('/:id', validateRequest(updateGateSchema), GateController.update);
router.post('/:id/regenerate-qr', GateController.regenerateQr);
router.delete('/:id', GateController.delete);

export default router;
