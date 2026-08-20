import { Router } from 'express';
import { VehicleController } from '../controllers/vehicleController';
import { validateRequest } from '../middleware/validateRequest';
import { createVehicleSchema, updateVehicleSchema } from '../validations/vehicleSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

const router = Router();

router.use(authMiddleware);

// Guard: only user (parker) tokens may touch vehicles
router.use((req, _res, next) => {
  if (req.user?.type !== 'user') {
    return next(new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Parker users only'));
  }
  next();
});

router.get('/', VehicleController.getAll);
router.get('/:id', VehicleController.getById);
router.post('/', validateRequest(createVehicleSchema), VehicleController.create);
router.put('/:id', validateRequest(updateVehicleSchema), VehicleController.update);
router.delete('/:id', VehicleController.delete);

export default router;
