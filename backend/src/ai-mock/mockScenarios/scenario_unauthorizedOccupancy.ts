/* eslint-disable no-console */
/**
 * Scenario: Unauthorized Slot Occupancy
 *
 * A slot flips to OCCUPIED with no matching active ParkingSession.
 * This triggers the UNAUTHORIZED_SLOT_OCCUPANCY alert in Phase 5.
 */
import { prisma } from '../../database/prismaClient';
import { DetectedStatus, DetectionType } from '@prisma/client';

export async function runUnauthorizedOccupancy(cameraId: number, slotId: number) {
  console.log(`[scenario_unauthorizedOccupancy] Slot ${slotId} flipped OCCUPIED with no session`);

  // Write a detection row showing OCCUPIED
  await prisma.detection.create({
    data: {
      camera_id: cameraId,
      slot_id: slotId,
      detection_type: DetectionType.SLOT_OCCUPANCY,
      detected_status: DetectedStatus.OCCUPIED,
      confidence_score: 0.92,
    },
  });

  // Update slot status directly — no session exists for this slot
  await prisma.parkingSlot.update({
    where: { slot_id: slotId },
    data: { status: 'OCCUPIED', last_status_updated_at: new Date() },
  });

  return { slotId, cameraId, detectedStatus: 'OCCUPIED', sessionExists: false };
}
