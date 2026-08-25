import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class CameraService {
  static async getAll() {
    return prisma.camera.findMany();
  }

  static async getById(id: number) {
    const camera = await prisma.camera.findUnique({ where: { camera_id: id } });
    if (!camera) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Camera not found');
    return camera;
  }

  static async create(data: any) {
    return prisma.camera.create({ data });
  }

  static async update(id: number, data: any) {
    await this.getById(id);
    return prisma.camera.update({ where: { camera_id: id }, data });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.camera.delete({ where: { camera_id: id } });
  }
}
