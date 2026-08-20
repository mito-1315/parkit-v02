import { Router } from 'express';
import { AdminUserController } from '../controllers/adminUserController';
import { validateRequest } from '../middleware/validateRequest';
import { updateAdminUserSchema } from '../validations/adminUserSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

const router = Router();

router.use(authMiddleware);

// Guard: only admin tokens may access admin-user profile routes
router.use((req, _res, next) => {
  if (req.user?.type !== 'admin') {
    return next(new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Admins only'));
  }
  next();
});

router.get('/me', AdminUserController.getMe);
router.put('/me', validateRequest(updateAdminUserSchema), AdminUserController.updateMe);

export default router;
