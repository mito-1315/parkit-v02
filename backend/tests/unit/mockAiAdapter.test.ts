import { MockAiAdapter } from '../../src/ai-mock/mockAiAdapter';
import { prisma } from '../../src/database/prismaClient';
import { DetectionType } from '@prisma/client';

describe('MockAiAdapter Unit Tests', () => {
  let adapter: MockAiAdapter;
  const mockRng = jest.fn();

  beforeEach(() => {
    mockRng.mockReset();
    mockRng.mockReturnValue(0.5); // Predictable RNG
    adapter = new MockAiAdapter(0.1, mockRng);
  });

  afterAll(async () => {
    // Cleanup any detections written during tests
    await prisma.detection.deleteMany({});
  });

  it('detectPlate should return forced plate with 100% chance and write detection', async () => {
    const facility = await prisma.facility.findFirst() ?? await prisma.facility.create({
      data: {
        name: 'AI Test',
        address: '1 Test St',
        city: 'City',
        state: 'ST',
        country: 'IN',
        pincode: '111111',
        contact_phone: '1',
        contact_email: 'ai@test.com',
        total_slots: 0,
      },
    });
    const camera = await prisma.camera.create({
      data: { facility_id: facility.facility_id, name: 'ANPR Test', camera_type: 'ANPR' },
    });

    const res = await adapter.detectPlate(camera.camera_id, 'TEST1234');
    expect(res).not.toBeNull();
    expect(res!.licensePlate).toBe('TEST1234');

    const written = await prisma.detection.findFirst({
      where: { camera_id: camera.camera_id, license_plate_detected: 'TEST1234' },
      orderBy: { detected_at: 'desc' }
    });
    expect(written).not.toBeNull();
    expect(written!.detection_type).toBe(DetectionType.VEHICLE_PLATE);
  });

  it('getSlotOccupancy should return readings and update DB', async () => {
    const camera = await prisma.camera.findFirst({ where: { camera_type: 'PARKING_SLOT_CAM' } });
    if (!camera) return;

    mockRng.mockReturnValue(0.01);

    const readings = await adapter.getSlotOccupancy(camera.camera_id);
    expect(readings.length).toBeGreaterThan(0);
    expect(readings[0]?.status).toBeDefined();

    const written = await prisma.detection.findFirst({
      where: { camera_id: camera.camera_id, detection_type: DetectionType.SLOT_OCCUPANCY },
      orderBy: { detected_at: 'desc' },
    });
    expect(written).not.toBeNull();
  });
});
