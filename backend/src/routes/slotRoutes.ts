import { Router } from 'express';
import { SlotController } from '../controllers/slotController';
import { validateRequest } from '../middleware/validateRequest';
import { createSlotSchema, updateSlotSchema, updateSlotStatusSchema } from '../validations/slotSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.get('/', SlotController.getAll);
router.post('/bulk', SlotController.generateBulk);
router.get('/:id', SlotController.getById);
router.post('/', validateRequest(createSlotSchema), SlotController.create);
router.put('/:id', validateRequest(updateSlotSchema), SlotController.update);
router.patch('/:id/status', validateRequest(updateSlotStatusSchema), SlotController.updateStatus);
router.delete('/:id', SlotController.delete);

export default router;
