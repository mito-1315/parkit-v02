import { Request, Response, NextFunction } from 'express';
import { DetectionService } from '../services/detectionService';

export class DetectionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DetectionService.create(req.body);
      res.status(201).json(result);
    } catch (e) { next(e); }
  }

  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await DetectionService.getAll());
    } catch (e) { next(e); }
  }
}
