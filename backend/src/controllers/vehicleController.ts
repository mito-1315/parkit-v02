import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicleService';

export class VehicleController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await VehicleService.getAll(req.user!.id));
    } catch (e) { next(e); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await VehicleService.getById(req.user!.id, Number(req.params.id)));
    } catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await VehicleService.create(req.user!.id, req.body));
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await VehicleService.update(req.user!.id, Number(req.params.id), req.body));
    } catch (e) { next(e); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await VehicleService.delete(req.user!.id, Number(req.params.id));
      res.status(204).send();
    } catch (e) { next(e); }
  }
}
