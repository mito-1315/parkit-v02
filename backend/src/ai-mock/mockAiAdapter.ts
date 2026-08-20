import {
  AiAdapter,
  BoxDetection,
  PlateReading,
  SlotOccupancyReading,
} from './aiAdapter.interface';
import { prisma } from '../database/prismaClient';
import { DetectedStatus, DetectionType } from '@prisma/client';

/** Small pool of realistic plates for repeatable manual testing */
export const PLATE_POOL = ['MH12AB1234', 'KA01XY5678', 'TN09CD9001', 'DL3CAF0021', 'GJ01AA2222'];

/** Shared near-identical box used as the onboarding dedup demo case. */
export const OVERLAP_BOX = { x: 0.12, y: 0.35, width: 0.14, height: 0.18 };

/** In-memory occupancy state: slotId → 'EMPTY' | 'OCCUPIED' */
const slotStateCache = new Map<number, 'EMPTY' | 'OCCUPIED'>();

export class MockAiAdapter implements AiAdapter {
  /** Probability (0..1) that a slot's status flips on any given call */
  private flipProbability: number;
  /** Optional seeded RNG for deterministic tests */
  private rng: () => number;
  private forcedGatePlate: string | null = null;

  constructor(flipProbability = 0.05, rng: () => number = Math.random) {
    this.flipProbability = flipProbability;
    this.rng = rng;
  }

  async getSlotOccupancy(cameraId: number): Promise<SlotOccupancyReading[]> {
    const slots = await prisma.parkingSlot.findMany({
      where: { primary_camera_id: cameraId, is_active: true },
      select: { slot_id: true },
    });

    const readings: SlotOccupancyReading[] = [];

    for (const { slot_id } of slots) {
      const current = slotStateCache.get(slot_id) ?? 'EMPTY';

      let newStatus: 'EMPTY' | 'OCCUPIED' = current;
      if (this.rng() < this.flipProbability) {
        newStatus = current === 'EMPTY' ? 'OCCUPIED' : 'EMPTY';
      }
      slotStateCache.set(slot_id, newStatus);

      const confidence = 0.7 + this.rng() * 0.29;

      await prisma.detection.create({
        data: {
          camera_id: cameraId,
          slot_id,
          detection_type: DetectionType.SLOT_OCCUPANCY,
          detected_status: newStatus === 'OCCUPIED' ? DetectedStatus.OCCUPIED : DetectedStatus.EMPTY,
          confidence_score: confidence,
        },
      });

      await prisma.parkingSlot.update({
        where: { slot_id },
        data: {
          status: newStatus === 'OCCUPIED' ? 'OCCUPIED' : 'AVAILABLE',
          last_status_updated_at: new Date(),
        },
      });

      readings.push({ slotId: slot_id, status: newStatus, confidence });
    }

    return readings;
  }

  async detectPlate(cameraId: number, forcePlate?: string): Promise<PlateReading | null> {
    const hasVehicle = forcePlate != null || this.rng() < 0.2;

    if (!hasVehicle) {
      await prisma.detection.create({
        data: {
          camera_id: cameraId,
          detection_type: DetectionType.VEHICLE_PLATE,
          confidence_score: 0,
        },
      });
      return null;
    }

    const plate = forcePlate ?? PLATE_POOL[Math.floor(this.rng() * PLATE_POOL.length)]!;
    const confidence = 0.7 + this.rng() * 0.29;

    await prisma.detection.create({
      data: {
        camera_id: cameraId,
        detection_type: DetectionType.VEHICLE_PLATE,
        license_plate_detected: plate,
        confidence_score: confidence,
      },
    });

    return { licensePlate: plate, confidence };
  }

  async extractParkingBoxes(cameraId: number): Promise<BoxDetection[]> {
    const camera = await prisma.camera.findUnique({ where: { camera_id: cameraId } });
    if (!camera) return [];

    const slotCams = await prisma.camera.findMany({
      where: { facility_id: camera.facility_id, camera_type: 'PARKING_SLOT_CAM' },
      orderBy: { camera_id: 'asc' },
      select: { camera_id: true },
    });
    const overlapIds = new Set(slotCams.slice(0, 2).map((c) => c.camera_id));
    const isOverlapCam = overlapIds.has(cameraId);

    const count = Math.min(15, Math.max(6, 6 + (cameraId % 10)));
    const boxes: BoxDetection[] = [];

    for (let i = 0; i < count; i++) {
      let boundingBox: BoxDetection['boundingBox'];
      if (isOverlapCam && i === 0) {
        boundingBox = { ...OVERLAP_BOX };
      } else {
        const col = i % 4;
        const row = Math.floor(i / 4);
        boundingBox = {
          x: 0.08 + col * 0.22,
          y: isOverlapCam ? 0.08 + ((row + 1) % 3) * 0.28 : 0.08 + row * 0.28,
          width: 0.16,
          height: 0.18,
        };
      }

      boxes.push({
        suggestedCode: `CAM${cameraId}-BOX${String(i + 1).padStart(2, '0')}`,
        boundingBox,
        confidence: Number((0.82 + (i % 5) * 0.03).toFixed(2)),
      });
    }

    await prisma.rawSlotDetection.deleteMany({
      where: { camera_id: cameraId, status: 'PENDING_REVIEW' },
    });

    await prisma.rawSlotDetection.createMany({
      data: boxes.map((b) => ({
        camera_id: cameraId,
        facility_id: camera.facility_id,
        suggested_code: b.suggestedCode,
        bounding_box: b.boundingBox,
        confidence: b.confidence,
        status: 'PENDING_REVIEW',
      })),
    });

    return boxes;
  }

  async detectPlateAtGate(
    gateId: number,
    forcePlate?: string,
  ): Promise<{ licensePlate: string; confidence: number } | null> {
    const gate = await prisma.gate.findUnique({ where: { gate_id: gateId } });
    if (!gate) return null;

    const plate =
      forcePlate ??
      this.forcedGatePlate ??
      PLATE_POOL[Math.abs(gateId) % PLATE_POOL.length]!;
    this.forcedGatePlate = null;

    const confidence = forcePlate ? 0.97 : 0.74 + (Math.abs(gateId) % 4) * 0.06;
    const cameraId = gate.camera_id;

    if (cameraId) {
      await prisma.detection.create({
        data: {
          camera_id: cameraId,
          gate_id: gateId,
          detection_type: DetectionType.VEHICLE_PLATE,
          license_plate_detected: plate,
          confidence_score: confidence,
        },
      });
    }

    return { licensePlate: plate, confidence };
  }

  /** Force-set a slot's in-memory state (used by dev routes + scenarios) */
  forceSlotState(slotId: number, status: 'EMPTY' | 'OCCUPIED') {
    slotStateCache.set(slotId, status);
  }

  /** Force the next detectPlateAtGate call to return this plate. */
  forceNextGatePlate(plate: string | null) {
    this.forcedGatePlate = plate;
  }

  /** Expose for testing */
  getSlotStateCache() {
    return slotStateCache;
  }
}

/** Singleton instance — the ONLY place MockAiAdapter is constructed */
export const mockAiAdapter = new MockAiAdapter();
