/**
 * Scenario: Normal Entry
 *
 * Simulates a vehicle arriving at the entry gate:
 * 1. ANPR camera detects a plate.
 * 2. A few seconds later, the assigned slot flips to OCCUPIED.
 */
import { AiAdapter } from '../aiAdapter.interface';
import { prisma } from '../../database/prismaClient';

export async function runNormalEntry(
  adapter: AiAdapter,
  anprCameraId: number,
  slotCameraId: number,
  forcePlate?: string
) {
  // Step 1: Detect plate at entry gate
  const plate = await adapter.detectPlate(anprCameraId, forcePlate ?? 'MH12AB1234');
  console.log('[scenario_normalEntry] Plate detected:', plate);

  // Step 2: After short delay, slot shows OCCUPIED
  await new Promise((r) => setTimeout(r, 2000));
  const readings = await adapter.getSlotOccupancy(slotCameraId);
  console.log('[scenario_normalEntry] Slot readings after entry:', readings);

  return { plate, readings };
}
