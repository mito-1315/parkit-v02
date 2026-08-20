import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { HTTP_STATUS } from '../config/constants';

/**
 * Middleware factory to restrict routes to specific admin roles.
 * Assumes authMiddleware has already run and attached req.user.
 */
export const roleCheck = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Not authenticated'));
    }

    if (req.user.type !== 'admin' || !req.user.role) {
      return next(new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Admins only'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Insufficient permissions for this role')
      );
    }

    next();
  };
};
