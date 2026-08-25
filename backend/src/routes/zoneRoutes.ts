import { Router } from 'express';
import { ZoneController } from '../controllers/zoneController';
import { validateRequest } from '../middleware/validateRequest';
import { createZoneSchema, updateZoneSchema } from '../validations/zoneSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.get('/', ZoneController.getAll);
router.get('/:id', ZoneController.getById);
router.post('/', validateRequest(createZoneSchema), ZoneController.create);
router.put('/:id', validateRequest(updateZoneSchema), ZoneController.update);
router.delete('/:id', ZoneController.delete);

export default router;
