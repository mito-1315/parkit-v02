import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class VehicleService {
  static async getAll(userId: number) {
    return prisma.vehicle.findMany({ where: { user_id: userId } });
  }

  static async getById(userId: number, vehicleId: number) {
    const vehicle = await prisma.vehicle.findUnique({ where: { vehicle_id: vehicleId } });
    if (!vehicle || vehicle.user_id !== userId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Vehicle not found');
    }
    return vehicle;
  }

  static async create(userId: number, data: any) {
    return prisma.vehicle.create({
      data: { ...data, user_id: userId },
    });
  }

  static async update(userId: number, vehicleId: number, data: any) {
    await this.getById(userId, vehicleId); // Ensures ownership
    return prisma.vehicle.update({ where: { vehicle_id: vehicleId }, data });
  }

  static async delete(userId: number, vehicleId: number) {
    await this.getById(userId, vehicleId); // Ensures ownership
    await prisma.vehicle.delete({ where: { vehicle_id: vehicleId } });
  }
}
