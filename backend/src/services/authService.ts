import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prismaClient';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { AdminRole } from '@prisma/client';

export class AuthService {
  static generateTokens(payload: { id: number; type: 'user' | 'admin'; role?: string }) {
    const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
    });
    
    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
    });

    return { accessToken, refreshToken };
  }

  static async registerUser(data: any) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'CONFLICT', 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        password_hash: passwordHash,
      },
    });

    return this.generateTokens({ id: user.user_id, type: 'user' });
  }

  static async loginUser(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.is_active) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid credentials');
    }

    return this.generateTokens({ id: user.user_id, type: 'user' });
  }

  static async registerAdmin(data: any, requestor?: { id: number; type: 'admin' | 'user'; role?: string }) {
    const adminCount = await prisma.adminUser.count();
    
    // Only allow unauthenticated registration if there are no admins at all
    if (adminCount > 0) {
      if (!requestor || requestor.type !== 'admin' || !['SUPER_ADMIN', 'FACILITY_ADMIN'].includes(requestor.role!)) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', 'Insufficient permissions to create an admin');
      }
    }

    const existing = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'CONFLICT', 'Admin email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const admin = await prisma.adminUser.create({
      data: {
        facility_id: data.facility_id,
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        password_hash: passwordHash,
        role: data.role,
      },
    });

    return this.generateTokens({ id: admin.admin_id, type: 'admin', role: admin.role });
  }

  static async loginAdmin(data: any) {
    const admin = await prisma.adminUser.findUnique({ where: { email: data.email } });
    if (!admin || !admin.is_active) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, admin.password_hash);
    if (!isValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid credentials');
    }

    await prisma.adminUser.update({
      where: { admin_id: admin.admin_id },
      data: { last_login_at: new Date() }
    });

    return this.generateTokens({ id: admin.admin_id, type: 'admin', role: admin.role });
  }

  static async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as { id: number; type: 'user' | 'admin'; role?: string };
      
      // Verify user/admin still exists and is active
      if (decoded.type === 'admin') {
        const admin = await prisma.adminUser.findUnique({ where: { admin_id: decoded.id } });
        if (!admin || !admin.is_active) throw new Error();
      } else {
        const user = await prisma.user.findUnique({ where: { user_id: decoded.id } });
        if (!user || !user.is_active) throw new Error();
      }

      const accessToken = jwt.sign({ id: decoded.id, type: decoded.type, role: decoded.role }, config.JWT_ACCESS_SECRET, {
        expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
      });

      return { accessToken };
    } catch (e) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', 'Invalid or expired refresh token');
    }
  }
}
