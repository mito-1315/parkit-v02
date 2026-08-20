import { prisma } from '../../src/database/prismaClient';
import { AllocationEngine } from '../../src/services/allocationEngine';

describe('Allocation Engine Full Lot', () => {
  let gateId: number;

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
        name: 'Full Facility',
        address: '123 Test St',
        city: 'Testville',
        state: 'TS',
        country: 'Testland',
        pincode: '12345',
        contact_phone: '1234567890',
        contact_email: 'test@full.com',
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

    // Create Gate
    const gate = await prisma.gate.create({
      data: {
        facility_id: facility.facility_id,
        name: 'Entry Gate',
        gate_type: 'ENTRY',
        qr_code: 'TEST_QR_FULL',
      },
    });
    gateId = gate.gate_id;

    // No AVAILABLE slots created!
  });

  afterAll(async () => {
    // Cleanup
    await prisma.parkingSession.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.facility.deleteMany();
  });

  it('should return cleanly when no slots are available', async () => {
    const result = await AllocationEngine.allocateSlot('FULL1234', gateId);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('PARKING_FULL');
    }
  });
});
