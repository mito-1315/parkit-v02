import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class FacilityService {
  static async getAll() {
    return prisma.facility.findMany();
  }

  static async getById(id: number) {
    const facility = await prisma.facility.findUnique({ where: { facility_id: id } });
    if (!facility) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Facility not found');
    return facility;
  }

  static async create(data: any) {
    return prisma.facility.create({ data });
  }

  static async update(id: number, data: any) {
    const existing = await prisma.facility.findUnique({ where: { facility_id: id } });
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Facility not found');
    
    return prisma.facility.update({ where: { facility_id: id }, data });
  }

  static async delete(id: number) {
    const existing = await prisma.facility.findUnique({ where: { facility_id: id } });
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Facility not found');
    
    await prisma.facility.delete({ where: { facility_id: id } });
  }

  static async getSlots(facilityId: number) {
    await this.getById(facilityId);
    return prisma.parkingSlot.findMany({
      where: { facility_id: facilityId },
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
      orderBy: [{ zone_id: 'asc' }, { slot_code: 'asc' }],
    });
  }
}
