import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Gate Endpoints', () => {
  let adminToken: string;
  let gateId: number;
  let facilityId: number;

  beforeAll(async () => {
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const facility = await prisma.facility.findFirst();
    facilityId = facility!.facility_id;
    
    await prisma.adminUser.upsert({
      where: { email: 'admin_gate@test.com' },
      update: {},
      create: { facility_id: facilityId, name: 'Gate Admin', email: 'admin_gate@test.com', password_hash: passwordHash, role: 'SUPER_ADMIN' }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({ email: 'admin_gate@test.com', password: 'password123' });
    adminToken = res.body.accessToken;
  });

  it('should create a gate', async () => {
    const res = await request(app)
      .post(`/api/v1/gates`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ facility_id: facilityId, name: 'TEST_GATE', gate_type: 'ENTRY', qr_code: 'TEST_QR' })
      .expect(201);
    gateId = res.body.gate_id;
  });

  it('should list gates', async () => {
    await request(app).get(`/api/v1/gates`).set('Authorization', `Bearer ${adminToken}`).expect(200);
  });

  it('should update a gate', async () => {
    await request(app).put(`/api/v1/gates/${gateId}`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'UPDATED_GATE' }).expect(200);
  });

  it('should delete a gate', async () => {
    await request(app).delete(`/api/v1/gates/${gateId}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
  });
});
