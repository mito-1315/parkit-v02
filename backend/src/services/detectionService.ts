import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { AllocationEngine } from './allocationEngine';
import { AlertService } from './alertService';

export interface CreateDetectionInput {
  camera_id: number;
  slot_id?: number;
  gate_id?: number;
  detection_type: string;
  detected_status?: string;
  license_plate_detected?: string;
  confidence_score?: number;
  bounding_box?: string;
}

export class DetectionService {
  /**
   * Primary ingestion path for all AI adapter outputs.
   * Both the mock adapter and (future) real model call this — nothing bypasses it.
   */
  static async create(data: CreateDetectionInput) {
    // Verify the camera exists
    const camera = await prisma.camera.findUnique({ where: { camera_id: data.camera_id }, include: { facility: true } });
    if (!camera) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `Camera ${data.camera_id} not found`);
    }

    // If a slot_id is provided, verify it exists
    if (data.slot_id !== undefined) {
      const slot = await prisma.parkingSlot.findUnique({ where: { slot_id: data.slot_id } });
      if (!slot) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `Slot ${data.slot_id} not found`);
      }
    }

    // If a gate_id is provided, verify it exists
    let gateObj = null;
    if (data.gate_id !== undefined) {
      gateObj = await prisma.gate.findUnique({ where: { gate_id: data.gate_id } });
      if (!gateObj) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `Gate ${data.gate_id} not found`);
      }
    }

    const detection = await prisma.detection.create({ data: data as any });

    // Phase 4: Trigger allocation if this is a VEHICLE_PLATE reading at an ENTRY gate
    if (
      data.detection_type === 'VEHICLE_PLATE' && 
      data.license_plate_detected && 
      gateObj?.gate_type === 'ENTRY'
    ) {
      // We don't necessarily await/block the detection response on the allocation success
      // But for testing purposes and synchronous flow we might want to await it,
      // or we just fire and forget. The prompt implies it's automatically triggered.
      // Let's await it to ensure consistency and easier testing.
      try {
        await AllocationEngine.allocateSlot(data.license_plate_detected, gateObj.gate_id);
      } catch (err) {
        console.error('Allocation failed for detection', detection.detection_id, err);
      }
    }

    // Hook 1: Low Confidence
    if (data.confidence_score !== undefined && data.confidence_score < 0.5) {
      await AlertService.raiseAlert({
        facility_id: camera.facility_id,
        alert_type: 'LOW_CONFIDENCE_DETECTION',
        severity: 'INFO',
        related_camera_id: camera.camera_id,
        message: `Low confidence detection (${data.confidence_score}) by camera ${camera.camera_id}`
      });
    }

    // Hooks related to SLOT_OCCUPANCY
    if (data.detection_type === 'SLOT_OCCUPANCY' && data.slot_id !== undefined && data.detected_status) {
      const slotId = data.slot_id;
      
      // Hook 2: Slot Conflict
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentContradictory = await prisma.detection.findFirst({
        where: {
          slot_id: slotId,
          camera_id: { not: camera.camera_id },
          detection_type: 'SLOT_OCCUPANCY',
          detected_status: { not: data.detected_status as any },
          detected_at: { gte: oneMinuteAgo }
        }
      });

      if (recentContradictory) {
        await AlertService.raiseAlert({
          facility_id: camera.facility_id,
          alert_type: 'SLOT_CONFLICT',
          severity: 'INFO',
          related_slot_id: slotId,
          message: `Contradictory slot status for slot ${slotId} from cameras ${camera.camera_id} and ${recentContradictory.camera_id}`
        });
      }

      // Hook 3: Unauthorized Occupancy
      if (data.detected_status === 'OCCUPIED') {
        const activeSession = await prisma.parkingSession.findFirst({
          where: {
            slot_id: slotId,
            status: { in: ['ACTIVE', 'RESERVED'] }
          }
        });

        if (!activeSession) {
          await AlertService.raiseAlert({
            facility_id: camera.facility_id,
            alert_type: 'UNAUTHORIZED_SLOT_OCCUPANCY',
            severity: 'CRITICAL',
            related_slot_id: slotId,
            message: `Slot ${slotId} is occupied but has no ACTIVE/RESERVED session`
          });
        }
      }

      // Hook 4: Parking Full
      // Calculate occupied vs total for the facility
      const totalSlots = camera.facility.total_slots;
      const occupiedSlots = await prisma.parkingSlot.count({
        where: { facility_id: camera.facility_id, status: 'OCCUPIED' }
      });

      if (totalSlots > 0 && (occupiedSlots / totalSlots) >= 0.95) {
        await AlertService.raiseAlert({
          facility_id: camera.facility_id,
          alert_type: 'PARKING_FULL',
          severity: 'WARNING',
          message: `Parking lot is >=95% full (${occupiedSlots}/${totalSlots})`
        });
      }
    }

    return detection;
  }

  static async getAll() {
    return prisma.detection.findMany({
      include: { camera: true, slot: true, gate: true },
      orderBy: { detected_at: 'desc' },
      take: 100,
    });
  }
}
