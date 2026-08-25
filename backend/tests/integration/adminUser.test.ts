import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('AdminUser Endpoints', () => {
  let adminToken: string;

  beforeAll(async () => {
    await prisma.adminUser.deleteMany({ where: { email: 'admin_me@test.com' } });
    const passwordHash = await require('bcrypt').hash('password123', 10);
    const facility = await prisma.facility.findFirst();
    await prisma.adminUser.create({
      data: { facility_id: facility!.facility_id, name: 'Me Admin', email: 'admin_me@test.com', password_hash: passwordHash, role: 'SUPER_ADMIN' }
    });

    const res = await request(app).post('/api/v1/auth/admin/login').send({ email: 'admin_me@test.com', password: 'password123' });
    adminToken = res.body.accessToken;
  });

  it('should get own profile', async () => {
    const res = await request(app).get(`/api/v1/admin-users/me`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(res.body.email).toBe('admin_me@test.com');
  });

  it('should update own profile', async () => {
    const res = await request(app).put(`/api/v1/admin-users/me`).set('Authorization', `Bearer ${adminToken}`).send({ name: 'Updated Me' }).expect(200);
    expect(res.body.name).toBe('Updated Me');
  });
});
