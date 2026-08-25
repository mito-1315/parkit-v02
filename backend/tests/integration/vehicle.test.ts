import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Vehicle Endpoints', () => {
  let user1Token: string;
  let user2Token: string;
  let user1VehicleId: number;

  beforeAll(async () => {
    // Ensure clean state for these users
    await prisma.user.deleteMany({ where: { email: { in: ['v1@test.com', 'v2@test.com'] } } });

    const u1 = await request(app).post('/api/v1/auth/register').send({
      name: 'U1', email: 'v1@test.com', password: 'password123'
    });
    user1Token = u1.body.accessToken;

    const u2 = await request(app).post('/api/v1/auth/register').send({
      name: 'U2', email: 'v2@test.com', password: 'password123'
    });
    user2Token = u2.body.accessToken;
  });

  it('should allow user1 to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ license_plate: 'U1PLATE', vehicle_type: 'CAR' })
      .expect(201);
    
    user1VehicleId = res.body.vehicle_id;
  });

  it('should block user2 from reading user1 vehicle', async () => {
    await request(app)
      .get(`/api/v1/vehicles/${user1VehicleId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(404);
  });

  it('should block user2 from updating user1 vehicle', async () => {
    await request(app)
      .put(`/api/v1/vehicles/${user1VehicleId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ license_plate: 'HACKED' })
      .expect(404);
  });

  it('should block user2 from deleting user1 vehicle', async () => {
    await request(app)
      .delete(`/api/v1/vehicles/${user1VehicleId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(404);
  });
});
