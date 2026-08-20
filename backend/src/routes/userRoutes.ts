import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateRequest } from '../middleware/validateRequest';
import { updateUserSchema } from '../validations/userSchema';
import { authMiddleware } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

const router = Router();

router.use(authMiddleware);

// Guard: only user (parker) tokens may access their own profile here
router.use((req, _res, next) => {
  if (req.user?.type !== 'user') {
    return next(new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Parker users only'));
  }
  next();
});

router.get('/me', UserController.getMe);
router.put('/me', validateRequest(updateUserSchema), UserController.updateMe);

export default router;
