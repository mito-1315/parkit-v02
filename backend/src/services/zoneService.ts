import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class ZoneService {
  static async getAll(facilityId: number) {
    return prisma.zone.findMany({ where: { facility_id: facilityId } });
  }

  static async getById(facilityId: number, id: number) {
    const zone = await prisma.zone.findUnique({ where: { zone_id: id } });
    if (!zone || zone.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Zone not found');
    }
    return zone;
  }

  static async create(facilityId: number, data: any) {
    return prisma.zone.create({
      data: { ...data, facility_id: facilityId },
    });
  }

  static async update(facilityId: number, id: number, data: any) {
    await this.getById(facilityId, id); // Ensure it exists and belongs to facility
    return prisma.zone.update({ where: { zone_id: id }, data });
  }

  static async delete(facilityId: number, id: number) {
    await this.getById(facilityId, id);
    await prisma.zone.delete({ where: { zone_id: id } });
  }
}
