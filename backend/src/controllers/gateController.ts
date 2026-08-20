import { Request, Response, NextFunction } from 'express';
import { GateService } from '../services/gateService';

export class GateController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await GateService.getAll());
    } catch (e) { next(e); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await GateService.getById(Number(req.params.id)));
    } catch (e) { next(e); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await GateService.create(req.body));
    } catch (e) { next(e); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await GateService.update(Number(req.params.id), req.body));
    } catch (e) { next(e); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await GateService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) { next(e); }
  }

  static async regenerateQr(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(await GateService.regenerateQr(Number(req.params.id)));
    } catch (e) { next(e); }
  }
}
