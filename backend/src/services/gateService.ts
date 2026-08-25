import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class GateService {
  static async getAll() {
    return prisma.gate.findMany();
  }

  static async getById(id: number) {
    const gate = await prisma.gate.findUnique({ where: { gate_id: id } });
    if (!gate) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Gate not found');
    return gate;
  }

  static async create(data: any) {
    return prisma.gate.create({ data });
  }

  static async update(id: number, data: any) {
    await this.getById(id);
    return prisma.gate.update({ where: { gate_id: id }, data });
  }

  static async delete(id: number) {
    await this.getById(id);
    await prisma.gate.delete({ where: { gate_id: id } });
  }

  static async regenerateQr(id: number) {
    await this.getById(id);
    const qr_code = `GATE_${id}_${Date.now().toString(36).toUpperCase()}`;
    return prisma.gate.update({ where: { gate_id: id }, data: { qr_code } });
  }
}
