import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';
import { HTTP_STATUS } from '../config/constants';

export interface JwtPayload {
  id: number;
  type: 'user' | 'admin';
  role?: string; // Only admins have a role
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'No token provided'));
  }

  const token = authHeader.split(' ')[1]!;

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as unknown as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1]!;

  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as unknown as JwtPayload;
    req.user = decoded;
  } catch (error) {
    // Ignore error for optional auth
  }
  next();
};
