import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';
import { DetectionType, DetectedStatus } from '@prisma/client';

describe('Detection Endpoints', () => {
  let adminToken: string;
  let cameraId: number;
  let slotId: number;

  beforeAll(async () => {
    // Generate admin token for GET tests
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const facility = await prisma.facility.findFirst();
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin_det@test.com' },
      update: {},
      create: {
        facility_id: facility!.facility_id,
        name: 'Det Admin',
        email: 'admin_det@test.com',
        password_hash: passwordHash,
        role: 'SUPER_ADMIN'
      }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: 'admin_det@test.com',
      password: 'password123'
    });
    adminToken = res.body.accessToken;

    const camera = await prisma.camera.findFirst();
    cameraId = camera!.camera_id;
    const slot = await prisma.parkingSlot.findFirst();
    slotId = slot!.slot_id;
  });

  it('should create a detection from AI (unauthenticated POST)', async () => {
    const res = await request(app)
      .post('/api/v1/detections')
      .send({
        camera_id: cameraId,
        slot_id: slotId,
        detection_type: DetectionType.SLOT_OCCUPANCY,
        detected_status: DetectedStatus.OCCUPIED,
        confidence_score: 0.95
      })
      .expect(201);

    expect(res.body.detection_id).toBeDefined();
    expect(res.body.confidence_score).toBe(0.95);
  });

  it('should return 400 for invalid payload', async () => {
    await request(app)
      .post('/api/v1/detections')
      .send({
        camera_id: cameraId, // missing detection_type
      })
      .expect(422); // Zod validation fails
  });

  it('should return 404 for non-existent camera', async () => {
    await request(app)
      .post('/api/v1/detections')
      .send({
        camera_id: 999999,
        detection_type: DetectionType.VEHICLE_PLATE,
        license_plate_detected: 'TEST999',
      })
      .expect(404);
  });

  it('should list detections for admin', async () => {
    const res = await request(app)
      .get('/api/v1/detections')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
