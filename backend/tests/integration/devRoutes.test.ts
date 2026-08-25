import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/database/prismaClient';

describe('Dev Routes (Mock AI)', () => {
  let cameraId: number;
  let slotId: number;

  beforeAll(async () => {
    const camera = await prisma.camera.findFirst();
    cameraId = camera!.camera_id;
    const slot = await prisma.parkingSlot.findFirst();
    slotId = slot!.slot_id;
  });

  it('POST /dev/mock/detect-plate should trigger plate detection', async () => {
    const res = await request(app)
      .post('/dev/mock/detect-plate')
      .send({ cameraId, licensePlate: 'DEVTEST1' })
      .expect(200);

    expect(res.body.result.licensePlate).toBe('DEVTEST1');
  });

  it('POST /dev/mock/flip-slot should force slot status', async () => {
    const res = await request(app)
      .post('/dev/mock/flip-slot')
      .send({ slotId, status: 'OCCUPIED' })
      .expect(200);

    expect(res.body.status).toBe('OCCUPIED');

    const check = await prisma.parkingSlot.findUnique({ where: { slot_id: slotId } });
    expect(check!.status).toBe('OCCUPIED');
  });

  it('POST /dev/mock/scenario/normalEntry should run scenario', async () => {
    const res = await request(app)
      .post('/dev/mock/scenario/normalEntry')
      .send({
        anprCameraId: cameraId,
        slotCameraId: cameraId,
        licensePlate: 'NORMAL123'
      })
      .expect(200);

    expect(res.body.scenario).toBe('normalEntry');
    expect(res.body.result.plate.licensePlate).toBe('NORMAL123');
  });

  it('POST /dev/mock/scenario/unknown should 404', async () => {
    await request(app)
      .post('/dev/mock/scenario/doesNotExist')
      .expect(404);
  });
});
