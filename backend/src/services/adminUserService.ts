import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class AdminUserService {
  static async getMe(adminId: number) {
    const admin = await prisma.adminUser.findUnique({
      where: { admin_id: adminId },
      select: {
        admin_id: true,
        facility_id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
      },
    });
    if (!admin) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Admin user not found');
    return admin;
  }

  static async updateMe(adminId: number, data: { name?: string; phone_number?: string }) {
    await this.getMe(adminId);
    return prisma.adminUser.update({
      where: { admin_id: adminId },
      data,
      select: {
        admin_id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
      },
    });
  }
}
