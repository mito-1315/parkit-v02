import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await UserService.getMe(req.user!.id));
    } catch (e) { next(e); }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await UserService.updateMe(req.user!.id, req.body));
    } catch (e) { next(e); }
  }
}
