import { execSync } from 'child_process';
import { prisma } from '../../src/database/prismaClient';

describe('Database Seeding Integration', () => {
  beforeAll(async () => {
    // Reset the test database, apply migrations, and skip initial seed
    execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'ignore' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully seed the database and create expected row counts', async () => {
    // Run the seed script
    execSync('npm run seed', { stdio: 'inherit' });

    const facilityCount = await prisma.facility.count();
    const zoneCount = await prisma.zone.count();
    const slotCount = await prisma.parkingSlot.count();
    const cameraCount = await prisma.camera.count();
    const ownedSlots = await prisma.parkingSlot.count({ where: { primary_camera_id: { not: null } } });
    const gateCount = await prisma.gate.count();
    const adminCount = await prisma.adminUser.count();
    const userCount = await prisma.user.count();
    const vehicleCount = await prisma.vehicle.count();
    const sessionCount = await prisma.parkingSession.count();
    const alertCount = await prisma.alert.count();

    expect(facilityCount).toBe(1);
    expect(zoneCount).toBe(3);
    expect(slotCount).toBe(20);
    expect(cameraCount).toBe(4);
    expect(ownedSlots).toBe(20);
    expect(gateCount).toBe(2);
    expect(adminCount).toBe(2);
    expect(userCount).toBe(5);
    expect(vehicleCount).toBe(5);
    expect(sessionCount).toBe(12);
    expect(alertCount).toBe(6);
  }, 30000); // 30s timeout for seeding

  it('should be idempotent (safe to run twice without duplicating)', async () => {
    // Run seed again
    execSync('npm run seed', { stdio: 'inherit' });

    // Counts should remain the same
    const facilityCount = await prisma.facility.count();
    const sessionCount = await prisma.parkingSession.count();

    expect(facilityCount).toBe(1);
    expect(sessionCount).toBe(12);
  }, 30000);
});
