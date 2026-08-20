import { Request, Response, NextFunction } from 'express';
import { AdminUserService } from '../services/adminUserService';

export class AdminUserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AdminUserService.getMe(req.user!.id));
    } catch (e) { next(e); }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await AdminUserService.updateMe(req.user!.id, req.body));
    } catch (e) { next(e); }
  }
}
