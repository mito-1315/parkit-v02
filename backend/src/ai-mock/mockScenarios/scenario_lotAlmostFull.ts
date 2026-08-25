/* eslint-disable no-console */
/**
 * Scenario: Lot Almost Full
 *
 * Flips enough slots to OCCUPIED that facility occupancy exceeds ~95%.
 * Forces slot state directly (bypasses the probabilistic flip) so it's immediate.
 */
import { MockAiAdapter } from '../mockAiAdapter';
import { prisma } from '../../database/prismaClient';

export async function runLotAlmostFull(adapter: MockAiAdapter, facilityId: number) {
  const slots = await prisma.parkingSlot.findMany({
    where: { facility_id: facilityId, is_active: true },
    select: { slot_id: true },
  });

  const targetCount = Math.ceil(slots.length * 0.95);
  const toOccupy = slots.slice(0, targetCount);

  for (const { slot_id } of toOccupy) {
    adapter.forceSlotState(slot_id, 'OCCUPIED');
    await prisma.parkingSlot.update({
      where: { slot_id },
      data: { status: 'OCCUPIED', last_status_updated_at: new Date() },
    });
  }

  console.log(`[scenario_lotAlmostFull] Set ${targetCount}/${slots.length} slots to OCCUPIED`);
  return { occupiedCount: targetCount, totalCount: slots.length };
}
