import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Zone Endpoints', () => {
  let adminToken: string;
  let facilityId: number;
  let zoneId: number;

  beforeAll(async () => {
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const facility = await prisma.facility.findFirst();
    facilityId = facility!.facility_id;
    
    await prisma.adminUser.upsert({
      where: { email: 'admin_zone@test.com' },
      update: {},
      create: { facility_id: facilityId, name: 'Zone Admin', email: 'admin_zone@test.com', password_hash: passwordHash, role: 'SUPER_ADMIN' }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({ email: 'admin_zone@test.com', password: 'password123' });
    adminToken = res.body.accessToken;
  });

  it('should create a zone', async () => {
    const res = await request(app)
      .post(`/api/v1/facilities/${facilityId}/zones`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Zone', floor_level: 1 })
      .expect(201);
    zoneId = res.body.zone_id;
  });

  it('should list zones', async () => {
    await request(app).get(`/api/v1/facilities/${facilityId}/zones`).set('Authorization', `Bearer ${adminToken}`).expect(200);
  });

  it('should update a zone', async () => {
    await request(app).put(`/api/v1/facilities/${facilityId}/zones/${zoneId}`).set('Authorization', `Bearer ${adminToken}`).send({ floor_level: 2 }).expect(200);
  });

  it('should delete a zone', async () => {
    await request(app).delete(`/api/v1/facilities/${facilityId}/zones/${zoneId}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
  });
});
