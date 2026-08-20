import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/sessionService';
import { HTTP_STATUS } from '../config/constants';
import { parseId } from '../utils/parseId';

export class SessionController {
  static async confirmEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseId(req.params.id, 'sessionId');
      const session = await SessionService.confirmEntry(sessionId);
      res.status(HTTP_STATUS.OK).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async confirmExit(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = parseId(req.params.id, 'sessionId');
      const { exitGateId } = req.body;
      if (!exitGateId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'exitGateId is required' });
        return;
      }
      const session = await SessionService.confirmExit(sessionId, exitGateId);
      res.status(HTTP_STATUS.OK).json(session);
    } catch (error) {
      next(error);
    }
  }

  static async getActiveSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = req.query.facilityId ? parseInt(req.query.facilityId as string, 10) : undefined;
      const userId = req.user?.type === 'user' ? req.user.id : undefined;
      const sessions = await SessionService.getActiveSessions(facilityId, userId);
      res.status(HTTP_STATUS.OK).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleId = req.query.vehicleId ? parseInt(req.query.vehicleId as string, 10) : undefined;
      const userId =
        req.user?.type === 'user'
          ? req.user.id
          : req.query.userId
            ? parseInt(req.query.userId as string, 10)
            : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
      const sessions = await SessionService.getHistory(vehicleId, userId, limit, skip);
      res.status(HTTP_STATUS.OK).json(sessions);
    } catch (error) {
      next(error);
    }
  }

  static async searchVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const plate = String(req.query.plate || '').trim();
      if (plate.length < 2) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'plate query must be at least 2 characters' });
        return;
      }
      const facilityId = req.query.facilityId ? parseInt(req.query.facilityId as string, 10) : undefined;
      const vehicles = await SessionService.searchByPlate(plate, facilityId);
      res.status(HTTP_STATUS.OK).json(vehicles);
    } catch (error) {
      next(error);
    }
  }
}
