/**
 * Phase 0 — Integration smoke test for GET /health
 * Uses supertest to hit the Express app without binding to a port.
 */

import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('returns 200 with { status: "ok", db: "not-checked-yet" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      db: 'not-checked-yet',
    });
    expect(res.body.timestamp).toBeDefined();
  });
});
