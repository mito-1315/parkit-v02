import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '../services/onboardingService';
import { HTTP_STATUS } from '../config/constants';
import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { parseId } from '../utils/parseId';

async function facilityIdForAdmin(req: Request): Promise<number> {
  if (!req.user || req.user.type !== 'admin') {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Admin authentication required');
  }
  const admin = await prisma.adminUser.findUnique({ where: { admin_id: req.user.id } });
  if (!admin) throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Admin not found');
  return admin.facility_id;
}

export class OnboardingController {
  static async status(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OnboardingService.getStatus();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async createFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OnboardingService.createFacilityAndAdmin(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async createZones(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.createZones(facilityId, req.body.zones);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async createCameras(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.createCameras(facilityId, req.body.cameras);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async captureEmptyLot(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.captureEmptyLot(parseId(req.params.id, 'cameraId'), facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async extractBoxes(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.extractBoxes(parseId(req.params.id, 'cameraId'), facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getRawDetections(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const result = await OnboardingService.getRawDetections(facilityId, status);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async rejectDetection(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.rejectDetection(parseId(req.params.id, 'detectionId'), facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async markDuplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const duplicateOfId = Number(req.body.duplicateOfId ?? req.body.duplicate_of_id);
      const result = await OnboardingService.markDuplicate(
        parseId(req.params.id, 'detectionId'),
        facilityId,
        duplicateOfId,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async confirmDetection(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.confirmDetection(parseId(req.params.id, 'detectionId'), facilityId, {
        slotCode: req.body.slotCode ?? req.body.slot_code,
        zoneId: Number(req.body.zoneId ?? req.body.zone_id),
        slotType: req.body.slotType ?? req.body.slot_type,
      });
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async createGates(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.createGates(facilityId, req.body.gates);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async setPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.setPricing(facilityId, {
        hourlyRate: Number(req.body.hourlyRate ?? req.body.hourly_rate),
        currency: req.body.currency ?? 'INR',
        gracePeriodMinutes: Number(req.body.gracePeriodMinutes ?? req.body.grace_period_minutes ?? 0),
        minimumFee: Number(req.body.minimumFee ?? req.body.minimum_fee ?? 0),
      });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.complete(facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.getSummary(facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async realignSlotZones(req: Request, res: Response, next: NextFunction) {
    try {
      const facilityId = await facilityIdForAdmin(req);
      const result = await OnboardingService.realignSlotZones(facilityId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (e) {
      next(e);
    }
  }
}
