import { Request, Response, NextFunction } from 'express';
import { AlertService } from '../services/alertService';
import { HTTP_STATUS } from '../config/constants';

export class AlertController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.is_resolved !== undefined) {
        filters.is_resolved = req.query.is_resolved === 'true';
      }
      if (req.query.severity) {
        filters.severity = req.query.severity as string;
      }
      if (req.query.alert_type) {
        filters.alert_type = req.query.alert_type as string;
      }
      if (req.query.facility_id) {
        filters.facility_id = parseInt(req.query.facility_id as string, 10);
      }

      const alerts = await AlertService.getAlerts(filters);
      res.status(HTTP_STATUS.OK).json(alerts);
    } catch (error) {
      next(error);
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alertId = parseInt(req.params.id, 10);
      const adminId = req.user?.id; // Assumes authMiddleware attaches user
      
      const alert = await AlertService.resolveAlert(alertId, adminId);
      res.status(HTTP_STATUS.OK).json(alert);
    } catch (error) {
      next(error);
    }
  }
}
