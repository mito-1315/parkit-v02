/* eslint-disable no-console */
import { Router, Request, Response, NextFunction } from 'express';
import { mockAiAdapter } from '../ai-mock/mockAiAdapter';
import { runNormalEntry } from '../ai-mock/mockScenarios/scenario_normalEntry';
import { runLotAlmostFull } from '../ai-mock/mockScenarios/scenario_lotAlmostFull';
import { runCameraOffline } from '../ai-mock/mockScenarios/scenario_cameraOffline';
import { runConflictingDetection } from '../ai-mock/mockScenarios/scenario_conflictingDetection';
import { runUnauthorizedOccupancy } from '../ai-mock/mockScenarios/scenario_unauthorizedOccupancy';
import { prisma } from '../database/prismaClient';

const router = Router();

/**
 * POST /dev/mock/detect-plate
 * Body: { cameraId: number, licensePlate?: string }
 */
router.post('/detect-plate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cameraId, licensePlate } = req.body;
    if (!cameraId) return res.status(400).json({ error: 'cameraId required' }) as any;
    const result = await mockAiAdapter.detectPlate(Number(cameraId), licensePlate);
    res.status(200).json({ result });
  } catch (e) { next(e); }
});

/**
 * POST /dev/mock/flip-slot
 * Body: { slotId: number, status: 'EMPTY' | 'OCCUPIED' }
 */
router.post('/flip-slot', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slotId, status } = req.body;
    if (!slotId || !status) return res.status(400).json({ error: 'slotId and status required' }) as any;
    mockAiAdapter.forceSlotState(Number(slotId), status);
    await prisma.parkingSlot.update({
      where: { slot_id: Number(slotId) },
      data: { status: status === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE', last_status_updated_at: new Date() },
    });
    res.status(200).json({ slotId, status });
  } catch (e) { next(e); }
});

/**
 * POST /dev/mock/scenario/:name
 * Runs a named scenario.
 */
router.post('/scenario/:name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    const body = req.body;

    let result: unknown;

    switch (name) {
      case 'normalEntry':
        result = await runNormalEntry(
          mockAiAdapter,
          Number(body.anprCameraId),
          Number(body.slotCameraId),
          body.licensePlate
        );
        break;

      case 'lotAlmostFull': {
        const facilityId = body.facilityId ?? 1;
        result = await runLotAlmostFull(mockAiAdapter, Number(facilityId));
        break;
      }

      case 'cameraOffline':
        result = runCameraOffline(Number(body.cameraId), body.durationMs);
        break;

      case 'conflictingDetection':
        result = await runConflictingDetection(
          mockAiAdapter,
          Number(body.slotId),
          Number(body.camera1Id),
          Number(body.camera2Id)
        );
        break;

      case 'unauthorizedOccupancy':
        result = await runUnauthorizedOccupancy(Number(body.cameraId), Number(body.slotId));
        break;

      default:
        return res.status(404).json({ error: `Unknown scenario: ${name}` }) as any;
    }

    res.status(200).json({ scenario: name, result });
  } catch (e) { next(e); }
});

export default router;
