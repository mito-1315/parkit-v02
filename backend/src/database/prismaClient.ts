import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';

/**
 * Singleton Prisma client instance.
 *
 * Avoids exhausting DB connections in dev with hot-reload.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
