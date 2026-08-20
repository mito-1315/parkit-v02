import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { getAiAdapter } from '../ai-mock';
import { AllocationEngine } from './allocationEngine';
import { SessionService } from './sessionService';

export class GateScanService {
  static async scanEntry(gateId: number, forcePlate?: string) {
    const gate = await prisma.gate.findUnique({
      where: { gate_id: gateId },
      include: { camera: true },
    });
    if (!gate) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Gate not found');

    const reading = await getAiAdapter().detectPlateAtGate(gateId, forcePlate);
    if (!reading) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NO_PLATE', 'No vehicle plate detected at this gate');
    }

    return {
      gate_id: gate.gate_id,
      gate_name: gate.name,
      gate_type: gate.gate_type,
      licensePlate: reading.licensePlate,
      confidence: reading.confidence,
      camera_id: gate.camera_id,
    };
  }

  static async confirmEntry(gateId: number, licensePlate: string, userId?: number) {
    const gate = await prisma.gate.findUnique({ where: { gate_id: gateId } });
    if (!gate) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Gate not found');

    const result = await AllocationEngine.allocateSlot(licensePlate.trim().toUpperCase(), gateId, userId);
    if (!result.success) {
      return { success: false as const, reason: result.reason };
    }
    return { success: true as const, session: result.session };
  }

  static async scanExit(
    gateId: number,
    opts: { sessionId?: number; licensePlate?: string; userId?: number; forcePlate?: string },
  ) {
    const gate = await prisma.gate.findUnique({ where: { gate_id: gateId } });
    if (!gate) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Gate not found');

    const reading = await getAiAdapter().detectPlateAtGate(gateId, opts.forcePlate);

    let sessionId = opts.sessionId;
    if (!sessionId) {
      const plate = (opts.licensePlate || reading?.licensePlate || '').trim().toUpperCase();
      const session = await prisma.parkingSession.findFirst({
        where: {
          status: 'ACTIVE',
          ...(opts.userId ? { user_id: opts.userId } : {}),
          ...(plate
            ? {
                vehicle: { license_plate: { equals: plate, mode: 'insensitive' } },
              }
            : {}),
        },
        orderBy: { created_at: 'desc' },
      });
      sessionId = session?.session_id;
    }

    if (!sessionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'No active session found to exit');
    }

    const session = await SessionService.confirmExit(sessionId, gateId);
    return {
      ...session,
      detectedPlate: reading?.licensePlate ?? null,
      detectedConfidence: reading?.confidence ?? null,
      currency: (session as any).facility?.currency ?? 'INR',
    };
  }
}
