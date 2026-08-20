import { Request, Response, NextFunction } from 'express';
import { SlotService } from '../services/slotService';
import { parseId } from '../utils/parseId';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class SlotController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const zoneId = parseId(req.params.zoneId, 'zoneId');
      const result = await SlotService.getAll(zoneId);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SlotService.getById(parseId(req.params.zoneId, 'zoneId'), parseId(req.params.id));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SlotService.create(parseId(req.params.zoneId, 'zoneId'), req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async generateBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const count = Number(req.body?.count);
      if (!Number.isFinite(count) || count < 1 || count > 100) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', 'count must be 1–100');
      }
      const result = await SlotService.generateBulk(
        parseId(req.params.zoneId, 'zoneId'),
        Math.floor(count),
        req.body?.slot_type,
        req.body?.prefix
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SlotService.update(parseId(req.params.zoneId, 'zoneId'), parseId(req.params.id), req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SlotService.updateStatus(parseId(req.params.zoneId, 'zoneId'), parseId(req.params.id), req.body.status);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SlotService.delete(parseId(req.params.zoneId, 'zoneId'), parseId(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
}
