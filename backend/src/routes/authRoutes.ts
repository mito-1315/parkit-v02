import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';
import {
  userRegisterSchema,
  adminRegisterSchema,
  loginSchema,
  refreshSchema,
} from '../validations/authSchema';

const router = Router();

router.post('/register', validateRequest(userRegisterSchema), AuthController.registerUser);
router.post(
  '/admin/register',
  optionalAuthMiddleware,
  validateRequest(adminRegisterSchema),
  AuthController.registerAdmin
);
router.post('/login', validateRequest(loginSchema), AuthController.loginUser);
router.post('/admin/login', validateRequest(loginSchema), AuthController.loginAdmin);
router.post('/refresh', validateRequest(refreshSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);

export default router;
