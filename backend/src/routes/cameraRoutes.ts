import { Router } from 'express';
import { CameraController } from '../controllers/cameraController';
import { validateRequest } from '../middleware/validateRequest';
import { createCameraSchema, updateCameraSchema } from '../validations/cameraSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

router.use(authMiddleware);
router.use(roleCheck(['SUPER_ADMIN', 'FACILITY_ADMIN']));

router.get('/', CameraController.getAll);
router.get('/:id', CameraController.getById);
router.post('/', validateRequest(createCameraSchema), CameraController.create);
router.put('/:id', validateRequest(updateCameraSchema), CameraController.update);
router.post('/:id/capture-empty-lot', CameraController.captureEmptyLot);
router.post('/:id/extract-boxes', CameraController.extractBoxes);
router.delete('/:id', CameraController.delete);

export default router;
