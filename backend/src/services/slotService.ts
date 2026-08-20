import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class SlotService {
  static async getAll(zoneId: number) {
    return prisma.parkingSlot.findMany({
      where: { zone_id: zoneId },
      include: {
        zone: true,
        primary_camera: true,
        parking_sessions: {
          where: { status: { in: ['RESERVED', 'ACTIVE'] } },
          include: { vehicle: true },
          take: 1,
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { slot_code: 'asc' },
    });
  }

  static async getById(zoneId: number, id: number) {
    const slot = await prisma.parkingSlot.findUnique({ where: { slot_id: id } });
    if (!slot || slot.zone_id !== zoneId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Slot not found');
    }
    return slot;
  }

  static async create(zoneId: number, data: any) {
    return prisma.parkingSlot.create({
      data: { ...data, zone_id: zoneId },
    });
  }

  static async update(zoneId: number, id: number, data: any) {
    await this.getById(zoneId, id); // Ensure it exists in this zone
    return prisma.parkingSlot.update({ where: { slot_id: id }, data });
  }

  static async updateStatus(zoneId: number, id: number, status: string) {
    await this.getById(zoneId, id);
    return prisma.parkingSlot.update({
      where: { slot_id: id },
      data: { status: status as any, last_status_updated_at: new Date() },
    });
  }

  static async delete(zoneId: number, id: number) {
    await this.getById(zoneId, id);
    await prisma.parkingSlot.delete({ where: { slot_id: id } });
  }

  static async generateBulk(zoneId: number, count: number, slotType = 'NORMAL', prefix = 'S') {
    const zone = await prisma.zone.findUnique({ where: { zone_id: zoneId } });
    if (!zone) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Zone not found');

    const existing = await prisma.parkingSlot.count({ where: { zone_id: zoneId } });
    const created = [];
    for (let i = 1; i <= count; i++) {
      const n = existing + i;
      const slot_code = `${prefix}${String(n).padStart(3, '0')}`;
      created.push(
        await prisma.parkingSlot.create({
          data: {
            facility_id: zone.facility_id,
            zone_id: zoneId,
            slot_code,
            slot_type: slotType as any,
            status: 'AVAILABLE',
          },
        })
      );
    }
    return created;
  }
}
