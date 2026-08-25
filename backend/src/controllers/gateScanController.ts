import { Request, Response, NextFunction } from 'express';
import { GateScanService } from '../services/gateScanService';
import { HTTP_STATUS } from '../config/constants';
import { parseId } from '../utils/parseId';

export class GateScanController {
  static async scanEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await GateScanService.scanEntry(
        parseId(req.params.id, 'gateId'),
        req.body?.forcePlate,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async confirmEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const licensePlate = req.body.licensePlate ?? req.body.license_plate;
      const userId = req.user?.type === 'user' ? req.user.id : undefined;
      const session = await GateScanService.confirmEntry(
        parseId(req.params.id, 'gateId'),
        licensePlate,
        userId,
      );
      if (!session.success) {
        res.status(HTTP_STATUS.OK).json({ success: false, reason: session.reason });
        return;
      }
      res.status(HTTP_STATUS.CREATED).json(session.session);
    } catch (e) {
      next(e);
    }
  }

  static async scanExit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.type === 'user' ? req.user.id : undefined;
      const result = await GateScanService.scanExit(parseId(req.params.id, 'gateId'), {
        sessionId: req.body?.sessionId ?? req.body?.session_id,
        licensePlate: req.body?.licensePlate ?? req.body?.license_plate,
        forcePlate: req.body?.forcePlate,
        userId,
      });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }
}
