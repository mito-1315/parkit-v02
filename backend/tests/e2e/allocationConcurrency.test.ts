import { prisma } from '../../src/database/prismaClient';
import { AllocationEngine } from '../../src/services/allocationEngine';

describe('Allocation Engine Concurrency', () => {
  let gateId: number;
  const numSlots = 5;
  const numConcurrentRequests = 10;

  beforeAll(async () => {
    // Clear relevant data
    await prisma.parkingSession.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.facility.deleteMany();

    // Create Facility
    const facility = await prisma.facility.create({
      data: {
        name: 'Test Facility',
        address: '123 Test St',
        city: 'Testville',
        state: 'TS',
        country: 'Testland',
        pincode: '12345',
        contact_phone: '1234567890',
        contact_email: 'test@facility.com',
        total_slots: 10,
      },
    });

    // Create Zone
    const zone = await prisma.zone.create({
      data: {
        facility_id: facility.facility_id,
        name: 'Zone A',
        floor_level: 1,
      },
    });

    // Create Slots (5 AVAILABLE)
    const slots = [];
    for (let i = 0; i < numSlots; i++) {
      slots.push({
        facility_id: facility.facility_id,
        zone_id: zone.zone_id,
        slot_code: `A${i}`,
        slot_type: 'NORMAL' as const,
        status: 'AVAILABLE' as const,
        is_active: true,
        distance_from_gate: 10 + i, // different distances
      });
    }
    await prisma.parkingSlot.createMany({ data: slots });

    // Create Gate
    const gate = await prisma.gate.create({
      data: {
        facility_id: facility.facility_id,
        name: 'Entry Gate',
        gate_type: 'ENTRY',
        qr_code: 'TEST_QR_ENTRY',
      },
    });
    gateId = gate.gate_id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.parkingSession.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.facility.deleteMany();
    // We should disconnect in afterAll typically, but prismaClient.test.ts might need it open if running together,
    // though Jest runs files isolated.
  });

  it('should successfully allocate exactly 5 slots out of 10 concurrent requests and not double-allocate', async () => {
    const plates = Array.from({ length: numConcurrentRequests }, (_, i) => `CONC${i}`);

    // Fire all requests concurrently
    const results = await Promise.all(
      plates.map(plate => AllocationEngine.allocateSlot(plate, gateId))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Exactly 5 should succeed
    expect(successful.length).toBe(numSlots);
    expect(failed.length).toBe(numConcurrentRequests - numSlots);

    // Ensure all failures are PARKING_FULL
    for (const f of failed) {
      if (!f.success) {
        expect(f.reason).toBe('PARKING_FULL');
      }
    }

    // Ensure no two successful allocations share the same slot
    const slotIds = successful.map(r => r.success ? r.session.slot_id : null);
    const uniqueSlotIds = new Set(slotIds);
    expect(uniqueSlotIds.size).toBe(numSlots);

    // Verify DB state
    const reservedSlots = await prisma.parkingSlot.count({
      where: { status: 'RESERVED' },
    });
    expect(reservedSlots).toBe(numSlots);

    const sessions = await prisma.parkingSession.count({
      where: { status: 'RESERVED' },
    });
    expect(sessions).toBe(numSlots);
  });
});
