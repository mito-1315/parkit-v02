import { prisma } from '../database/prismaClient';
import { ParkingSession } from '@prisma/client';
import { sessionInclude } from '../utils/parseId';
import { getIo } from '../sockets';

export type AllocationResult =
  | { success: true; session: ParkingSession }
  | { success: false; reason: 'PARKING_FULL' | 'GATE_NOT_FOUND' | 'INTERNAL_ERROR' };

// Weighted constants for scoring
export const WEIGHT_DISTANCE = 1.0;
export const WEIGHT_ZONE_CONGESTION = 0.5;
export const WEIGHT_TYPE_MATCH = 2.0;

export class AllocationEngine {
  static async allocateSlot(
    vehiclePlate: string,
    entryGateId: number,
    userId?: number,
  ): Promise<AllocationResult> {
    const gate = await prisma.gate.findUnique({
      where: { gate_id: entryGateId },
    });
    
    if (!gate) return { success: false, reason: 'GATE_NOT_FOUND' };

    let vehicle = await prisma.vehicle.findUnique({
      where: { license_plate: vehiclePlate }
    });

    if (!vehicle) {
      let ownerId = userId;
      if (!ownerId) {
        const walkInUser = await prisma.user.upsert({
          where: { email: 'walkin@system.local' },
          update: {},
          create: {
            name: 'Walk-In System User',
            email: 'walkin@system.local',
            password_hash: 'none',
            is_active: true,
          },
        });
        ownerId = walkInUser.user_id;
      }

      vehicle = await prisma.vehicle.create({
        data: {
          license_plate: vehiclePlate,
          vehicle_type: 'CAR',
          is_registered: Boolean(userId),
          user_id: ownerId,
        },
      });
    }

    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Only AVAILABLE slots are candidates — RESERVED / OCCUPIED / MAINTENANCE /
      // BLOCKED / UNKNOWN are never allocated, even if they are closer.
      const candidates = await prisma.parkingSlot.findMany({
        where: {
          facility_id: gate.facility_id,
          status: 'AVAILABLE',
          is_active: true,
        },
        include: { zone: true }
      });

      if (candidates.length === 0) {
        return { success: false, reason: 'PARKING_FULL' };
      }

      const compatibleCandidates = candidates.filter(slot => this.isCompatible(vehicle!.vehicle_type, slot.slot_type));

      if (compatibleCandidates.length === 0) {
        return { success: false, reason: 'PARKING_FULL' };
      }

      const zoneAvailableCounts = candidates.reduce((acc, slot) => {
        acc[slot.zone_id] = (acc[slot.zone_id] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const scoredCandidates = compatibleCandidates.map(slot => {
        let score = 0;
        
        // Distance: lower distance -> higher score
        const dist = slot.distance_from_gate || 50; 
        score -= dist * WEIGHT_DISTANCE;

        // Congestion: more available slots in zone -> higher score
        const availableInZone = zoneAvailableCounts[slot.zone_id] || 0;
        score += availableInZone * WEIGHT_ZONE_CONGESTION;

        // Type Match: Exact match -> bonus
        if (this.isExactMatch(vehicle!.vehicle_type, slot.slot_type)) {
          score += 50 * WEIGHT_TYPE_MATCH;
        }

        return { slot, score };
      });

      scoredCandidates.sort((a, b) => b.score - a.score);

      const bestSlot = scoredCandidates[0]!.slot;

      try {
        // Reserve slot inside transaction using row-level locking
        // Using SELECT ... FOR UPDATE to avoid race conditions.
        // We use Prisma's interactive transaction.
        const session = await prisma.$transaction(async (tx) => {
          const lockedRows = await tx.$queryRaw<any[]>`
            SELECT slot_id, status FROM "ParkingSlot" 
            WHERE slot_id = ${bestSlot.slot_id} 
            FOR UPDATE NOWAIT
          `;

          if (lockedRows.length === 0 || lockedRows[0].status !== 'AVAILABLE') {
            throw new Error('SLOT_NOT_AVAILABLE');
          }

          await tx.parkingSlot.update({
            where: { slot_id: bestSlot.slot_id },
            data: { 
              status: 'RESERVED',
              last_status_updated_at: new Date()
            }
          });

          return tx.parkingSession.create({
            data: {
              facility_id: gate.facility_id,
              vehicle_id: vehicle!.vehicle_id,
              user_id: vehicle!.user_id,
              slot_id: bestSlot.slot_id,
              entry_gate_id: gate.gate_id,
              status: 'RESERVED',
              allocated_at: new Date()
            },
            include: sessionInclude,
          });
        });

        try {
          const io = getIo();
          io.of('/dashboard').to(`facility_${gate.facility_id}`).emit('session:updated', session);
          io.of('/dashboard').to(`facility_${gate.facility_id}`).emit('slot:statusChanged', {
            slot_id: session.slot_id,
            status: 'RESERVED',
          });
        } catch {
          // sockets may not be up in tests
        }

        return { success: true, session };
      } catch (err: any) {
        // Retry if slot was not available or could not obtain lock
        if (err.message === 'SLOT_NOT_AVAILABLE' || err.code === 'P2034' || (err.message && err.message.includes('could not obtain lock'))) {
          continue;
        }
        throw err;
      }
    }

    return { success: false, reason: 'PARKING_FULL' };
  }

  static isCompatible(vehicleType: string, slotType: string): boolean {
    if (vehicleType === 'TRUCK' && slotType !== 'HEAVY') return false;
    if (vehicleType === 'TWO_WHEELER' && !['TWO_WHEELER', 'NORMAL'].includes(slotType)) return false;
    if (['CAR', 'EV_CAR'].includes(vehicleType) && slotType === 'TWO_WHEELER') return false;
    return true;
  }

  static isExactMatch(vehicleType: string, slotType: string): boolean {
    if (vehicleType === 'EV_CAR' && slotType === 'EV') return true;
    if (vehicleType === 'TWO_WHEELER' && slotType === 'TWO_WHEELER') return true;
    if (vehicleType === 'TRUCK' && slotType === 'HEAVY') return true;
    if (vehicleType === 'CAR' && slotType === 'NORMAL') return true;
    return false;
  }
}
