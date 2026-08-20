import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Allocation Routes', () => {
  let gateId: number;

  beforeAll(async () => {
    // Basic setup
    await prisma.parkingSession.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.rawSlotDetection.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.camera.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.facility.deleteMany();

    const facility = await prisma.facility.create({
      data: {
        name: 'Route Test Facility',
        address: '123 Test',
        city: 'City',
        state: 'ST',
        country: 'Country',
        pincode: '12345',
        contact_phone: '123',
        contact_email: 'test@route.com',
        total_slots: 10,
      },
    });

    const zone = await prisma.zone.create({
      data: { facility_id: facility.facility_id, name: 'Zone A', floor_level: 1 },
    });

    await prisma.parkingSlot.create({
      data: {
        facility_id: facility.facility_id,
        zone_id: zone.zone_id,
        slot_code: `R1`,
        slot_type: 'NORMAL',
        status: 'AVAILABLE',
      },
    });

    const gate = await prisma.gate.create({
      data: {
        facility_id: facility.facility_id,
        name: 'Route Entry Gate',
        gate_type: 'ENTRY',
        qr_code: 'ROUTE_QR_ENTRY',
      },
    });
    gateId = gate.gate_id;
  });

  afterAll(async () => {
    await prisma.parkingSession.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.rawSlotDetection.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.camera.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.facility.deleteMany();
  });

  it('POST /api/v1/allocations should allocate a slot', async () => {
    const res = await request(app)
      .post('/api/v1/allocations')
      .send({ licensePlate: 'ROUTE123', entryGateId: gateId });
      
    expect(res.status).toBe(201); // CREATED
    expect(res.body.slot_id).toBeDefined();
    expect(res.body.status).toBe('RESERVED');
  });

  it('POST /api/v1/allocations should return OK with success=false if parking is full', async () => {
    const res = await request(app)
      .post('/api/v1/allocations')
      .send({ licensePlate: 'ROUTE456', entryGateId: gateId });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.reason).toBe('PARKING_FULL');
  });
});
