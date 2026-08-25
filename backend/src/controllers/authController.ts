import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerUser(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.loginUser(req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerAdmin(req.body, req.user as any);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async loginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.loginAdmin(req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refreshToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async logout(_req: Request, res: Response, _next: NextFunction) {
    // For JWTs stored client-side, the client just discards them. 
    // If we used HTTP-only cookies, we would clear them here.
    res.status(200).json({ message: 'Logged out successfully' });
  }
}
