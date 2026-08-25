import { Request, Response } from 'express';
import { AllocationEngine } from '../services/allocationEngine';
import { HTTP_STATUS } from '../config/constants';
import { prisma } from '../database/prismaClient';

export class AllocationController {
  static async allocateSlot(req: Request, res: Response) {
    try {
      const { licensePlate, entryGateId, qrCode, qr_code } = req.body;
      let gateId = entryGateId ? Number(entryGateId) : undefined;

      if (!gateId && (qrCode || qr_code)) {
        const gate = await prisma.gate.findUnique({ where: { qr_code: String(qrCode || qr_code) } });
        gateId = gate?.gate_id;
      }

      if (!licensePlate || !gateId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Missing required fields: licensePlate and entryGateId (or qrCode)'
        });
      }

      const result = await AllocationEngine.allocateSlot(licensePlate, gateId);

      if (result.success) {
        return res.status(HTTP_STATUS.CREATED).json(result.session);
      } else {
        return res.status(HTTP_STATUS.OK).json({ success: false, reason: result.reason });
      }
    } catch (error: any) {
      console.error('AllocationController Error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }
}
