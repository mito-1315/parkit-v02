import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { getIo } from '../sockets';
import { sessionInclude } from '../utils/parseId';
import { calculateParkingFee } from './feeCalculator';

export class SessionService {
  static async confirmEntry(sessionId: number) {
    const session = await prisma.parkingSession.findUnique({ where: { session_id: sessionId } });
    
    if (!session) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Session not found');
    if (session.status !== 'RESERVED') throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_STATE', 'Session is not RESERVED');

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.parkingSession.update({
        where: { session_id: sessionId },
        data: {
          status: 'ACTIVE',
          entry_time: new Date(),
        },
        include: sessionInclude,
      });

      const updatedSlot = await tx.parkingSlot.update({
        where: { slot_id: session.slot_id },
        data: {
          status: 'OCCUPIED',
          last_status_updated_at: new Date()
        }
      });

      return { updatedSession, updatedSlot };
    });

    const io = getIo();
    io.of('/dashboard').to(`facility_${session.facility_id}`).emit('session:updated', result.updatedSession);
    io.of('/dashboard').to(`facility_${session.facility_id}`).emit('slot:statusChanged', result.updatedSlot);

    return result.updatedSession;
  }

  static async confirmExit(sessionId: number, exitGateId: number) {
    const session = await prisma.parkingSession.findUnique({
      where: { session_id: sessionId },
      include: sessionInclude,
    });
    
    if (!session) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Session not found');
    if (session.status !== 'ACTIVE') throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_STATE', 'Session is not ACTIVE');

    const exitTime = new Date();
    const durationMinutes = Math.max(0, Math.floor((exitTime.getTime() - session.entry_time!.getTime()) / 60000));
    const facility = await prisma.facility.findUnique({ where: { facility_id: session.facility_id } });
    const parkingFee = calculateParkingFee({
      durationMinutes,
      gracePeriodMinutes: facility?.grace_period_minutes ?? 0,
      hourlyRate: Number(facility?.hourly_rate ?? 0),
      minimumFee: Number(facility?.minimum_fee ?? 0),
    });

    const result = await prisma.$transaction(async (tx) => {
      const updatedSession = await tx.parkingSession.update({
        where: { session_id: sessionId },
        data: {
          status: 'COMPLETED',
          exit_time: exitTime,
          exit_gate_id: exitGateId,
          duration_minutes: durationMinutes,
          parking_fee: parkingFee,
          payment_status: 'PENDING',
        },
        include: sessionInclude,
      });

      const updatedSlot = await tx.parkingSlot.update({
        where: { slot_id: session.slot_id },
        data: {
          status: 'AVAILABLE',
          last_status_updated_at: exitTime
        }
      });

      return { updatedSession, updatedSlot };
    });

    const io = getIo();
    io.of('/dashboard').to(`facility_${session.facility_id}`).emit('session:updated', result.updatedSession);
    io.of('/dashboard').to(`facility_${session.facility_id}`).emit('slot:statusChanged', result.updatedSlot);

    return result.updatedSession;
  }

  static async getActiveSessions(facilityId?: number, userId?: number) {
    return prisma.parkingSession.findMany({
      where: {
        status: { in: ['RESERVED', 'ACTIVE'] },
        ...(facilityId ? { facility_id: facilityId } : {}),
        ...(userId ? { user_id: userId } : {}),
      },
      include: sessionInclude,
      orderBy: { created_at: 'desc' }
    });
  }

  static async getHistory(vehicleId?: number, userId?: number, limit: number = 50, skip: number = 0) {
    return prisma.parkingSession.findMany({
      where: {
        ...(vehicleId ? { vehicle_id: vehicleId } : {}),
        ...(userId ? { user_id: userId } : {})
      },
      include: sessionInclude,
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: skip
    });
  }

  static async searchByPlate(plate: string, facilityId?: number) {
    const vehicles = await prisma.vehicle.findMany({
      where: { license_plate: { contains: plate, mode: 'insensitive' } },
      include: {
        user: { select: { user_id: true, name: true, email: true, phone_number: true } },
        parking_sessions: {
          where: facilityId ? { facility_id: facilityId } : {},
          include: sessionInclude,
          orderBy: { created_at: 'desc' },
          take: 20,
        },
      },
      take: 25,
    });
    return vehicles;
  }

  static async expireStaleSessions() {
    // Configurable timeout in minutes, default 20
    const timeoutMins = parseInt(process.env.SESSION_EXPIRY_MINUTES || '20', 10);
    const cutoffTime = new Date(Date.now() - timeoutMins * 60000);

    const staleSessions = await prisma.parkingSession.findMany({
      where: {
        status: 'RESERVED',
        allocated_at: { lt: cutoffTime }
      }
    });

    for (const session of staleSessions) {
      const result = await prisma.$transaction(async (tx) => {
        const updatedSession = await tx.parkingSession.update({
          where: { session_id: session.session_id },
          data: { status: 'EXPIRED' }
        });

        const updatedSlot = await tx.parkingSlot.update({
          where: { slot_id: session.slot_id },
          data: { status: 'AVAILABLE', last_status_updated_at: new Date() }
        });

        return { updatedSession, updatedSlot };
      });

      const io = getIo();
      io.of('/dashboard').to(`facility_${session.facility_id}`).emit('session:updated', result.updatedSession);
      io.of('/dashboard').to(`facility_${session.facility_id}`).emit('slot:statusChanged', result.updatedSlot);
    }
    
    return staleSessions.length;
  }
}
