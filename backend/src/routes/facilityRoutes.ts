import { Router } from 'express';
import { FacilityController } from '../controllers/facilityController';
import { validateRequest } from '../middleware/validateRequest';
import { createFacilitySchema, updateFacilitySchema } from '../validations/facilitySchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.get('/', FacilityController.getAll);
router.get('/:id/slots', FacilityController.getSlots);
router.get('/:id', FacilityController.getById);
router.post('/', validateRequest(createFacilitySchema), FacilityController.create);
router.put('/:id', validateRequest(updateFacilitySchema), FacilityController.update);
router.delete('/:id', FacilityController.delete);

export default router;
