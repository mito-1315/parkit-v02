/* eslint-disable no-console */
/**
 * Scenario: Conflicting Detection
 *
 * Two cameras report contradictory occupancy for the same slot within a short
 * window. This is the data that Phase 5's alert system uses to raise a
 * SLOT_CONFLICT alert. (Live occupancy is owned by a single primary camera;
 * this scenario still injects two Detection rows for alert testing.)
 */
import { AiAdapter } from '../aiAdapter.interface';
import { prisma } from '../../database/prismaClient';
<<<<<<< HEAD
import { DetectedStatus, DetectionType } from '../../enums';
=======
import { DetectedStatus, DetectionType } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export async function runConflictingDetection(
  adapter: AiAdapter,
  slotId: number,
  camera1Id: number,
  camera2Id: number
) {
  console.log(`[scenario_conflictingDetection] Injecting conflict for slot ${slotId}`);

  // Camera 1 reports EMPTY
  await prisma.detection.create({
    data: {
      camera_id: camera1Id,
      slot_id: slotId,
      detection_type: DetectionType.SLOT_OCCUPANCY,
      detected_status: DetectedStatus.EMPTY,
      confidence_score: 0.85,
    },
  });

  // Camera 2 reports OCCUPIED for the same slot within the same second
  await prisma.detection.create({
    data: {
      camera_id: camera2Id,
      slot_id: slotId,
      detection_type: DetectionType.SLOT_OCCUPANCY,
      detected_status: DetectedStatus.OCCUPIED,
      confidence_score: 0.88,
    },
  });

  console.log(`[scenario_conflictingDetection] Conflict injected: cam ${camera1Id}=EMPTY, cam ${camera2Id}=OCCUPIED`);
  return { slotId, camera1Id, camera2Id };
}
