import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

export class UserService {
  static async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone_number: true,
        is_active: true,
        created_at: true,
      },
    });
    if (!user) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'User not found');
    return user;
  }

  static async updateMe(userId: number, data: { name?: string; phone_number?: string }) {
    await this.getMe(userId);
    return prisma.user.update({
      where: { user_id: userId },
      data,
      select: {
        user_id: true,
        name: true,
        email: true,
        phone_number: true,
      },
    });
  }
}
