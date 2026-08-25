import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/reportService';

export class ReportController {
  static async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = req.query.facilityId
        ? parseInt(String(req.query.facilityId), 10)
        : undefined;
      res.status(200).json(await ReportService.getDaily(Number.isFinite(facilityId) ? facilityId : undefined));
    } catch (e) {
      next(e);
    }
  }
}
