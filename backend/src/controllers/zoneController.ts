import { Request, Response, NextFunction } from 'express';
import { ZoneService } from '../services/zoneService';

export class ZoneController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ZoneService.getAll(Number(req.params.facilityId));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ZoneService.getById(Number(req.params.facilityId), Number(req.params.id));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ZoneService.create(Number(req.params.facilityId), req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ZoneService.update(Number(req.params.facilityId), Number(req.params.id), req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ZoneService.delete(Number(req.params.facilityId), Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
