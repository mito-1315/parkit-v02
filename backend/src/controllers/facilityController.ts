import { Request, Response, NextFunction } from 'express';
import { FacilityService } from '../services/facilityService';

export class FacilityController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.getAll();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.getById(Number(req.params.id));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.create(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.update(Number(req.params.id), req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await FacilityService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }

  static async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await FacilityService.getSlots(Number(req.params.id));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}
