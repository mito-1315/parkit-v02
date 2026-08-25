import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Facility Endpoints', () => {
  let adminToken: string;
  let facilityId: number;

  beforeAll(async () => {
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const admin = await prisma.adminUser.upsert({
      where: { email: 'admin_fac@test.com' },
      update: {},
      create: {
        facility_id: 1, // Doesn't matter, we use SUPER_ADMIN
        name: 'Fac Admin',
        email: 'admin_fac@test.com',
        password_hash: passwordHash,
        role: 'SUPER_ADMIN'
      }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({
      email: 'admin_fac@test.com',
      password: 'password123'
    });
    adminToken = res.body.accessToken;
  });

  it('should create a facility', async () => {
    const res = await request(app)
      .post('/api/v1/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Facility',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        pincode: '123456',
        contact_phone: '1234567890',
        contact_email: 'test@facility.com',
        total_slots: 100
      })
      .expect(201);
    
    facilityId = res.body.facility_id;
  });

  it('should read a facility', async () => {
    await request(app)
      .get(`/api/v1/facilities/${facilityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should update a facility', async () => {
    await request(app)
      .put(`/api/v1/facilities/${facilityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ total_slots: 200 })
      .expect(200);
  });

  it('should list facilities', async () => {
    const res = await request(app)
      .get('/api/v1/facilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should delete a facility', async () => {
    await request(app)
      .delete(`/api/v1/facilities/${facilityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    await request(app)
      .get(`/api/v1/facilities/${facilityId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('should block unauthenticated request', async () => {
    await request(app).get('/api/v1/facilities').expect(401);
  });
});
