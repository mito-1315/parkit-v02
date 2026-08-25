import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Auth Endpoints', () => {
  const userPayload = {
    name: 'Test Parker',
    email: 'parker@test.com',
    password: 'password123',
    phone_number: '1234567890'
  };

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: userPayload.email } });
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(userPayload)
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userPayload.email, password: userPayload.password })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
  });

  it('should allow access to protected route with token', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.email).toBe(userPayload.email);
  });

  it('should fail with invalid token', async () => {
    await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer invalid-token`)
      .expect(401);
  });

  it('should refresh token successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.accessToken).not.toBe(accessToken);
  });
});
