import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('User Endpoints', () => {
  let userToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'user_me@test.com' } });
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'Me User', email: 'user_me@test.com', password: 'password123' });
    userToken = res.body.accessToken;
  });

  it('should get own profile', async () => {
    const res = await request(app).get(`/api/v1/users/me`).set('Authorization', `Bearer ${userToken}`).expect(200);
    expect(res.body.email).toBe('user_me@test.com');
  });

  it('should update own profile', async () => {
    const res = await request(app).put(`/api/v1/users/me`).set('Authorization', `Bearer ${userToken}`).send({ name: 'Updated Me' }).expect(200);
    expect(res.body.name).toBe('Updated Me');
  });
});
