import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';
import { config } from '../../src/config/env';
import { OVERLAP_BOX } from '../../src/ai-mock/mockAiAdapter';

async function wipe() {
  await prisma.alert.deleteMany();
  await prisma.parkingSession.deleteMany();
  await prisma.detection.deleteMany();
  await prisma.rawSlotDetection.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.gate.deleteMany();
  await prisma.camera.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();
}

describe('Onboarding e2e', () => {
  let token: string;
  let slotCamA: number;
  let slotCamB: number;
  let anprEntry: number;
  let anprExit: number;
  let zoneId: number;

  beforeAll(async () => {
    await wipe();
  });

  afterAll(async () => {
    await wipe();
  });

  it('GET /onboarding/status is unauthenticated and reports an empty install', async () => {
    const res = await request(app).get('/api/v1/onboarding/status').expect(200);
    expect(res.body.hasFacility).toBe(false);
    expect(res.body.onboardingStatus).toBeNull();
  });

  it('walks through every wizard endpoint and refuses complete until valid', async () => {
    const created = await request(app)
      .post('/api/v1/onboarding/facility')
      .send({
        name: 'Harbor Mall',
        address: '1 Harbor Road',
        city: 'Port City',
        state: 'PC',
        country: 'IN',
        pincode: '400001',
        contact_phone: '9999999999',
        contact_email: 'ops@harbormall.test',
        admin: {
          name: 'Harbor Admin',
          email: 'harbor.admin@test.com',
          password: 'password123',
        },
      })
      .expect(201);

    token = created.body.accessToken;
    expect(created.body.facility.onboarding_status).toBe('IN_PROGRESS');
    expect(created.body.facility.onboarding_step).toBe(1);
    const auth = { Authorization: `Bearer ${token}` };

    const zones = await request(app)
      .post('/api/v1/onboarding/zones')
      .set(auth)
      .send({ zones: [{ name: 'P1', floor_level: 1 }] })
      .expect(201);
    zoneId = zones.body[0].zone_id;

    const cameras = await request(app)
      .post('/api/v1/onboarding/cameras')
      .set(auth)
      .send({
        cameras: [
          { name: 'Lot Cam A', camera_type: 'PARKING_SLOT_CAM', zone_id: zoneId },
          { name: 'Lot Cam B', camera_type: 'PARKING_SLOT_CAM', zone_id: zoneId },
          { name: 'Entry ANPR', camera_type: 'ANPR' },
          { name: 'Exit ANPR', camera_type: 'ANPR' },
        ],
      })
      .expect(201);

    slotCamA = cameras.body[0].camera_id;
    slotCamB = cameras.body[1].camera_id;
    anprEntry = cameras.body[2].camera_id;
    anprExit = cameras.body[3].camera_id;

    await request(app).post(`/api/v1/cameras/${slotCamA}/capture-empty-lot`).set(auth).expect(200);
    await request(app).post(`/api/v1/cameras/${slotCamB}/capture-empty-lot`).set(auth).expect(200);

    const extractedA = await request(app).post(`/api/v1/cameras/${slotCamA}/extract-boxes`).set(auth).expect(200);
    const extractedB = await request(app).post(`/api/v1/cameras/${slotCamB}/extract-boxes`).set(auth).expect(200);
    expect(extractedA.body.length).toBeGreaterThanOrEqual(6);
    expect(extractedB.body.length).toBeGreaterThanOrEqual(6);

    const pending = await request(app)
      .get('/api/v1/onboarding/raw-detections?status=PENDING_REVIEW')
      .set(auth)
      .expect(200);

    const boxes = pending.body.cameras.flatMap((c: any) => c.detections);
    const overlapA = boxes.find(
      (d: any) => d.camera_id === slotCamA && d.bounding_box?.x === OVERLAP_BOX.x && d.bounding_box?.y === OVERLAP_BOX.y,
    );
    const overlapB = boxes.find(
      (d: any) => d.camera_id === slotCamB && d.bounding_box?.x === OVERLAP_BOX.x && d.bounding_box?.y === OVERLAP_BOX.y,
    );
    expect(overlapA).toBeDefined();
    expect(overlapB).toBeDefined();

    await request(app)
      .post(`/api/v1/raw-detections/${overlapB.detection_id}/mark-duplicate`)
      .set(auth)
      .send({ duplicateOfId: overlapA.detection_id })
      .expect(200);

    const incomplete = await request(app).post('/api/v1/onboarding/complete').set(auth).expect(400);
    expect(incomplete.body.error.code).toBe('ONBOARDING_INCOMPLETE');

    const stillPending = await request(app)
      .get('/api/v1/onboarding/raw-detections?status=PENDING_REVIEW')
      .set(auth)
      .expect(200);

    const remaining = stillPending.body.cameras.flatMap((c: any) => c.detections) as any[];
    const firstA = remaining.find((d) => d.camera_id === slotCamA);
    const firstB = remaining.find((d) => d.camera_id === slotCamB);
    expect(firstA).toBeDefined();
    expect(firstB).toBeDefined();

    await request(app)
      .post(`/api/v1/raw-detections/${firstA.detection_id}/confirm`)
      .set(auth)
      .send({ slotCode: 'A-01', zoneId, slotType: 'NORMAL' })
      .expect(201);

    await request(app)
      .post(`/api/v1/raw-detections/${firstB.detection_id}/confirm`)
      .set(auth)
      .send({ slotCode: 'B-01', zoneId, slotType: 'NORMAL' })
      .expect(201);

    const leftover = remaining.filter(
      (d) => d.detection_id !== firstA.detection_id && d.detection_id !== firstB.detection_id,
    );
    for (const d of leftover) {
      await request(app).post(`/api/v1/raw-detections/${d.detection_id}/reject`).set(auth).expect(200);
    }

    const noGates = await request(app).post('/api/v1/onboarding/complete').set(auth).expect(400);
    expect(noGates.body.error.message).toMatch(/gate/i);

    await request(app)
      .post('/api/v1/onboarding/gates')
      .set(auth)
      .send({
        gates: [{ name: 'Entry', gate_type: 'ENTRY', camera_id: slotCamA }],
      })
      .expect(201);

    const badAnpr = await request(app).post('/api/v1/onboarding/complete').set(auth).expect(400);
    expect(badAnpr.body.error.message).toMatch(/ANPR/i);

    await prisma.gate.deleteMany();

    await request(app)
      .post('/api/v1/onboarding/gates')
      .set(auth)
      .send({
        gates: [
          { name: 'Main Entry', gate_type: 'ENTRY', camera_id: anprEntry },
          { name: 'Main Exit', gate_type: 'EXIT', camera_id: anprExit },
        ],
      })
      .expect(201);

    await request(app)
      .post('/api/v1/onboarding/pricing')
      .set(auth)
      .send({ hourlyRate: 50, currency: 'INR', gracePeriodMinutes: 10, minimumFee: 15 })
      .expect(200);

    const done = await request(app).post('/api/v1/onboarding/complete').set(auth).expect(200);
    expect(done.body.onboarding_status).toBe('COMPLETED');

    const slots = await prisma.parkingSlot.findMany();
    for (const slot of slots) {
      expect(slot.primary_camera_id).toBeTruthy();
    }

    const status = await request(app).get('/api/v1/onboarding/status').expect(200);
    expect(status.body.onboardingStatus).toBe('COMPLETED');
  });
});

describe('confirm-entry never allocates RESERVED slots', () => {
  let gateId: number;
  let availableId: number;
  let token: string;

  beforeAll(async () => {
    await prisma.parkingSession.deleteMany();
    await prisma.rawSlotDetection.deleteMany();
    await prisma.parkingSlot.deleteMany();
    await prisma.gate.deleteMany();
    await prisma.camera.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'alloc-excl@test.com' } });
    await prisma.adminUser.deleteMany({ where: { email: 'alloc-excl-admin@test.com' } });
    await prisma.facility.deleteMany({ where: { contact_email: 'alloc-excl@test.com' } });

    const facility = await prisma.facility.create({
      data: {
        name: 'Exclusion Lot',
        address: '1 Test',
        city: 'City',
        state: 'ST',
        country: 'IN',
        pincode: '111111',
        contact_phone: '111',
        contact_email: 'alloc-excl@test.com',
        total_slots: 2,
        onboarding_status: 'COMPLETED',
      },
    });

    const zone = await prisma.zone.create({
      data: { facility_id: facility.facility_id, name: 'Z', floor_level: 0 },
    });

    const reserved = await prisma.parkingSlot.create({
      data: {
        facility_id: facility.facility_id,
        zone_id: zone.zone_id,
        slot_code: 'CLOSE',
        slot_type: 'NORMAL',
        status: 'RESERVED',
        distance_from_gate: 1,
      },
    });
    const available = await prisma.parkingSlot.create({
      data: {
        facility_id: facility.facility_id,
        zone_id: zone.zone_id,
        slot_code: 'FAR',
        slot_type: 'NORMAL',
        status: 'AVAILABLE',
        distance_from_gate: 100,
      },
    });
    availableId = available.slot_id;
    void reserved;

    const camera = await prisma.camera.create({
      data: { facility_id: facility.facility_id, name: 'ANPR', camera_type: 'ANPR' },
    });
    const gate = await prisma.gate.create({
      data: {
        facility_id: facility.facility_id,
        name: 'Entry',
        gate_type: 'ENTRY',
        qr_code: 'EXCL_QR',
        camera_id: camera.camera_id,
      },
    });
    gateId = gate.gate_id;

    const user = await prisma.user.create({
      data: {
        name: 'Excl User',
        email: 'alloc-excl@test.com',
        password_hash: 'none',
      },
    });
    token = jwt.sign({ id: user.user_id, type: 'user' }, config.JWT_ACCESS_SECRET, { expiresIn: '1h' });
  });

  it('POST /gates/:id/confirm-entry skips the closer RESERVED slot', async () => {
    const res = await request(app)
      .post(`/api/v1/gates/${gateId}/confirm-entry`)
      .set('Authorization', `Bearer ${token}`)
      .send({ licensePlate: 'EXCL9999' })
      .expect(201);

    expect(res.body.slot_id).toBe(availableId);
    expect(res.body.status).toBe('RESERVED');
  });
});
