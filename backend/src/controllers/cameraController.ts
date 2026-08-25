import { Request, Response, NextFunction } from 'express';
import { CameraService } from '../services/cameraService';
import { OnboardingController } from './onboardingController';

export class CameraController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CameraService.getAll();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CameraService.getById(Number(req.params.id));
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CameraService.create(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CameraService.update(Number(req.params.id), req.body);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CameraService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }

  static captureEmptyLot = OnboardingController.captureEmptyLot;
  static extractBoxes = OnboardingController.extractBoxes;
}
