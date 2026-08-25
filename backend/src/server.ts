/* eslint-disable no-console */
import app from './app';
import { config } from './config/env';
import { logger } from './middleware/requestLogger';
import { initSockets } from './sockets';
import { startBackgroundJobs } from './services/backgroundJobs';

const server = app.listen(config.PORT, () => {
  initSockets(server);
  startBackgroundJobs();
  logger.info(`🚀  Smart Parking API listening on http://localhost:${config.PORT}`);
  logger.info(`   Environment : ${config.NODE_ENV}`);

  // ─── Background mock AI polling ─────────────────────────────────────────────
  if (config.MOCK_AI_ENABLED) {
    logger.info('🤖  Mock AI enabled — starting background slot occupancy polling (5s interval)');

    // Lazy imports to avoid loading Prisma / mock during tests that don't need it
    Promise.all([
      import('./ai-mock/mockAiAdapter'),
      import('./database/prismaClient'),
      import('./ai-mock/mockScenarios/scenario_cameraOffline'),
    ]).then(([{ mockAiAdapter }, { prisma }, { isCameraOffline }]) => {
      setInterval(async () => {
        try {
          const cameras = await prisma.camera.findMany({
            where: { camera_type: 'PARKING_SLOT_CAM', status: 'ONLINE' },
            select: { camera_id: true },
          });

          for (const { camera_id } of cameras) {
            if (isCameraOffline(camera_id)) continue;
            await mockAiAdapter.getSlotOccupancy(camera_id);
          }
        } catch (err) {
          logger.error({ err }, 'Mock AI polling error');
        }
      }, 5_000);
    });
  }
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info(`Received ${signal} — shutting down gracefully…`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force-exit if server hasn't closed in 10 s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;

