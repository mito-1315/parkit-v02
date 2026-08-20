import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Slot Endpoints', () => {
  let adminToken: string;
  let zoneId: number;
  let slotId: number;
  let facilityId: number;

  beforeAll(async () => {
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const zone = await prisma.zone.findFirst();
    zoneId = zone!.zone_id;
    facilityId = zone!.facility_id;
    
    await prisma.adminUser.upsert({
      where: { email: 'admin_slot@test.com' },
      update: {},
      create: { facility_id: facilityId, name: 'Slot Admin', email: 'admin_slot@test.com', password_hash: passwordHash, role: 'SUPER_ADMIN' }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({ email: 'admin_slot@test.com', password: 'password123' });
    adminToken = res.body.accessToken;
  });

  it('should create a slot', async () => {
    const res = await request(app)
      .post(`/api/v1/zones/${zoneId}/slots`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ facility_id: facilityId, slot_code: 'TEST-A1', slot_type: 'STANDARD' })
      .expect(201);
    slotId = res.body.slot_id;
  });

  it('should update slot status separately', async () => {
    const res = await request(app)
      .patch(`/api/v1/zones/${zoneId}/slots/${slotId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'OCCUPIED' })
      .expect(200);
    expect(res.body.status).toBe('OCCUPIED');
  });

  it('should update a slot details', async () => {
    await request(app).put(`/api/v1/zones/${zoneId}/slots/${slotId}`).set('Authorization', `Bearer ${adminToken}`).send({ slot_code: 'TEST-A2' }).expect(200);
  });

  it('should list slots', async () => {
    await request(app).get(`/api/v1/zones/${zoneId}/slots`).set('Authorization', `Bearer ${adminToken}`).expect(200);
  });

  it('should delete a slot', async () => {
    await request(app).delete(`/api/v1/zones/${zoneId}/slots/${slotId}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
  });
});
