import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Camera Endpoints', () => {
  let adminToken: string;
  let cameraId: number;
  let facilityId: number;

  beforeAll(async () => {
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const facility = await prisma.facility.findFirst();
    facilityId = facility!.facility_id;
    
    await prisma.adminUser.upsert({
      where: { email: 'admin_cam@test.com' },
      update: {},
      create: { facility_id: facilityId, name: 'Cam Admin', email: 'admin_cam@test.com', password_hash: passwordHash, role: 'SUPER_ADMIN' }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({ email: 'admin_cam@test.com', password: 'password123' });
    adminToken = res.body.accessToken;
  });

  it('should create a camera', async () => {
    const res = await request(app)
      .post(`/api/v1/cameras`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ facility_id: facilityId, name: 'TEST_CAM', camera_type: 'PARKING_SLOT_CAM' })
      .expect(201);
    cameraId = res.body.camera_id;
  });

  it('should list cameras', async () => {
    await request(app).get(`/api/v1/cameras`).set('Authorization', `Bearer ${adminToken}`).expect(200);
  });

  it('should update a camera', async () => {
    await request(app).put(`/api/v1/cameras/${cameraId}`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'UPDATED_CAM' }).expect(200);
  });

  it('should delete a camera', async () => {
    await request(app).delete(`/api/v1/cameras/${cameraId}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
  });
});
