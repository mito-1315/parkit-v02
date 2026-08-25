import bcrypt from 'bcrypt';
import { CameraType, GateType, SlotType } from '../enums';
import { prisma } from '../database/prismaClient';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { AuthService } from './authService';
import { getAiAdapter } from '../ai-mock';

const EMPTY_LOT_IMAGES = [
  '/static/empty-lots/lot-a.svg',
  '/static/empty-lots/lot-b.svg',
  '/static/empty-lots/lot-c.svg',
];

function pickEmptyLotImage(cameraId: number) {
  return EMPTY_LOT_IMAGES[(cameraId - 1) % EMPTY_LOT_IMAGES.length]!;
}

export class OnboardingService {
  static async getStatus() {
    const facility = await prisma.facility.findFirst({ orderBy: { facility_id: 'asc' } });
    const adminCount = await prisma.adminUser.count();
    return {
      hasFacility: Boolean(facility),
      hasAdmin: adminCount > 0,
      onboardingStatus: facility?.onboarding_status ?? null,
      onboardingStep: facility?.onboarding_step ?? 0,
      facilityId: facility?.facility_id ?? null,
    };
  }

  static async createFacilityAndAdmin(data: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    contact_phone: string;
    contact_email: string;
    admin: { name: string; email: string; password: string; phone_number?: string };
  }) {
    const existingEmail = await prisma.adminUser.findUnique({ where: { email: data.admin.email } });
    if (existingEmail) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'CONFLICT', 'Admin email already in use');
    }

    const password_hash = await bcrypt.hash(data.admin.password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const facility = await tx.facility.create({
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          total_slots: 0,
          onboarding_status: 'IN_PROGRESS',
          onboarding_step: 1,
        },
      });

      const admin = await tx.adminUser.create({
        data: {
          facility_id: facility.facility_id,
          name: data.admin.name,
          email: data.admin.email,
          phone_number: data.admin.phone_number,
          password_hash,
          role: 'FACILITY_ADMIN',
        },
      });

      return { facility, admin };
    });

    const tokens = AuthService.generateTokens({
      id: result.admin.admin_id,
      type: 'admin',
      role: result.admin.role,
    });

    return {
      ...tokens,
      facility: result.facility,
      admin: {
        admin_id: result.admin.admin_id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role,
        facility_id: result.admin.facility_id,
      },
    };
  }

  static async createZones(facilityId: number, zones: Array<{ name: string; floor_level: number; description?: string }>) {
    await this.requireInProgress(facilityId);
    const created = await prisma.$transaction(
      zones.map((z) =>
        prisma.zone.create({
          data: {
            facility_id: facilityId,
            name: z.name,
            floor_level: z.floor_level,
            description: z.description,
          },
        }),
      ),
    );
    await this.setStep(facilityId, 2);
    return created;
  }

  static async createCameras(
    facilityId: number,
    cameras: Array<{
      name: string;
      camera_type: CameraType;
      zone_id?: number | null;
      location_description?: string | null;
    }>,
  ) {
    await this.requireInProgress(facilityId);
    const created = [];
    for (const c of cameras) {
      created.push(
        await prisma.camera.create({
          data: {
            facility_id: facilityId,
            name: c.name,
            camera_type: c.camera_type,
            zone_id: c.zone_id ?? null,
            location_description: c.location_description ?? null,
          },
        }),
      );
    }
    await this.setStep(facilityId, 3);
    return created;
  }

  static async captureEmptyLot(cameraId: number, facilityId: number) {
    const camera = await prisma.camera.findUnique({ where: { camera_id: cameraId } });
    if (!camera || camera.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Camera not found');
    }
    if (camera.camera_type !== 'PARKING_SLOT_CAM') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', 'Empty-lot capture is only for slot-watching cameras');
    }
    return prisma.camera.update({
      where: { camera_id: cameraId },
      data: { empty_lot_image_url: pickEmptyLotImage(cameraId) },
    });
  }

  static async extractBoxes(cameraId: number, facilityId: number) {
    const camera = await prisma.camera.findUnique({ where: { camera_id: cameraId } });
    if (!camera || camera.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Camera not found');
    }
    if (camera.camera_type !== 'PARKING_SLOT_CAM') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', 'Box extraction is only for slot-watching cameras');
    }
    if (!camera.empty_lot_image_url) {
      await prisma.camera.update({
        where: { camera_id: cameraId },
        data: { empty_lot_image_url: pickEmptyLotImage(cameraId) },
      });
    }

    await getAiAdapter().extractParkingBoxes(cameraId);
    await this.setStep(facilityId, 4);

    return prisma.rawSlotDetection.findMany({
      where: { camera_id: cameraId },
      orderBy: { detection_id: 'asc' },
    });
  }

  static async getRawDetections(facilityId: number, status?: string) {
    const where: any = { facility_id: facilityId };
    if (status) where.status = status;

    const cameras = await prisma.camera.findMany({
      where: { facility_id: facilityId, camera_type: 'PARKING_SLOT_CAM' },
      orderBy: { camera_id: 'asc' },
    });

    const detections = await prisma.rawSlotDetection.findMany({
      where,
      orderBy: { detection_id: 'asc' },
    });

    return {
      cameras: cameras.map((camera) => ({
        ...camera,
        detections: detections.filter((d) => d.camera_id === camera.camera_id),
      })),
      pendingCount: detections.filter((d) => d.status === 'PENDING_REVIEW').length,
    };
  }

  static async rejectDetection(id: number, facilityId: number) {
    const detection = await this.requirePending(id, facilityId);
    const updated = await prisma.rawSlotDetection.update({
      where: { detection_id: detection.detection_id },
      data: { status: 'REJECTED' },
    });
    await this.maybeAdvanceReviewStep(facilityId);
    return updated;
  }

  static async markDuplicate(id: number, facilityId: number, duplicateOfId: number) {
    const detection = await this.requirePending(id, facilityId);
    if (duplicateOfId === id) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', 'A detection cannot be a duplicate of itself');
    }
    const other = await prisma.rawSlotDetection.findUnique({ where: { detection_id: duplicateOfId } });
    if (!other || other.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Matching detection not found');
    }
    if (other.camera_id === detection.camera_id) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', 'Duplicate must be from a different camera');
    }

    const updated = await prisma.rawSlotDetection.update({
      where: { detection_id: detection.detection_id },
      data: { status: 'DUPLICATE_REMOVED', duplicate_of_id: duplicateOfId },
    });
    await this.maybeAdvanceReviewStep(facilityId);
    return updated;
  }

  static async confirmDetection(
    id: number,
    facilityId: number,
    body: { slotCode: string; zoneId: number; slotType: SlotType },
  ) {
    const detection = await this.requirePending(id, facilityId);
    const zone = await prisma.zone.findUnique({ where: { zone_id: body.zoneId } });
    if (!zone || zone.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Zone not found');
    }

    const existing = await prisma.parkingSlot.findUnique({
      where: { facility_id_slot_code: { facility_id: facilityId, slot_code: body.slotCode } },
    });
    if (existing) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'CONFLICT', 'Slot code already exists in this facility');
    }

    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.parkingSlot.create({
        data: {
          facility_id: facilityId,
          zone_id: body.zoneId,
          slot_code: body.slotCode,
          slot_type: body.slotType,
          status: 'AVAILABLE',
          coordinates: JSON.stringify(detection.bounding_box),
          primary_camera_id: detection.camera_id,
          source_detection_id: detection.detection_id,
        },
      });

      const updated = await tx.rawSlotDetection.update({
        where: { detection_id: detection.detection_id },
        data: { status: 'CONFIRMED', promoted_slot_id: slot.slot_id },
      });

      await tx.facility.update({
        where: { facility_id: facilityId },
        data: { total_slots: { increment: 1 } },
      });

      return { detection: updated, slot };
    });

    await this.maybeAdvanceReviewStep(facilityId);
    return result;
  }

  static async createGates(
    facilityId: number,
    gates: Array<{
      name: string;
      gate_type: GateType;
      camera_id?: number | null;
      location_description?: string | null;
    }>,
  ) {
    await this.requireInProgress(facilityId);
    // Idempotent: wipe previously saved gates so the wizard can be re-submitted
    await prisma.gate.deleteMany({ where: { facility_id: facilityId } });
    const created = [];
    for (const g of gates) {
      if (g.camera_id) {
        const camera = await prisma.camera.findUnique({ where: { camera_id: g.camera_id } });
        if (!camera || camera.facility_id !== facilityId) {
          throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `Camera ${g.camera_id} not found`);
        }
      }
      const qr_code = `GATE_${facilityId}_${Date.now().toString(36).toUpperCase()}_${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
      created.push(
        await prisma.gate.create({
          data: {
            facility_id: facilityId,
            name: g.name,
            gate_type: g.gate_type,
            camera_id: g.camera_id ?? null,
            location_description: g.location_description ?? null,
            qr_code,
          },
        }),
      );
    }
    await this.setStep(facilityId, 6);
    return created;
  }

  static async setPricing(
    facilityId: number,
    pricing: {
      hourlyRate: number;
      currency: string;
      gracePeriodMinutes: number;
      minimumFee: number;
    },
  ) {
    await this.requireInProgress(facilityId);
    const facility = await prisma.facility.update({
      where: { facility_id: facilityId },
      data: {
        hourly_rate: pricing.hourlyRate,
        currency: pricing.currency,
        grace_period_minutes: pricing.gracePeriodMinutes,
        minimum_fee: pricing.minimumFee,
        onboarding_step: 7,
      },
    });
    return facility;
  }

  static async complete(facilityId: number) {
    await this.requireInProgress(facilityId);

    const slotCams = await prisma.camera.findMany({
      where: { facility_id: facilityId, camera_type: 'PARKING_SLOT_CAM' },
    });
    if (slotCams.length === 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'ONBOARDING_INCOMPLETE', 'Add at least one slot-watching camera');
    }

    for (const cam of slotCams) {
      const totalDetections = await prisma.rawSlotDetection.count({
        where: { camera_id: cam.camera_id },
      });
      // Cameras added after the extraction step have no detections at all — skip them.
      // Only enforce confirmed slots for cameras that actually went through extraction.
      if (totalDetections === 0) continue;

      const confirmed = await prisma.rawSlotDetection.count({
        where: { camera_id: cam.camera_id, status: 'CONFIRMED' },
      });
      if (confirmed === 0) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'ONBOARDING_INCOMPLETE',
          `Camera "${cam.name}" has no confirmed slots`,
        );
      }
    }

    const gates = await prisma.gate.findMany({
      where: { facility_id: facilityId },
      include: { camera: true },
    });
    if (gates.length === 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'ONBOARDING_INCOMPLETE', 'Add at least one gate');
    }
    for (const gate of gates) {
      if (!gate.camera || gate.camera.camera_type !== 'ANPR') {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'ONBOARDING_INCOMPLETE',
          `Gate "${gate.name}" must have an ANPR camera assigned`,
        );
      }
    }

    const pending = await prisma.rawSlotDetection.count({
      where: { facility_id: facilityId, status: 'PENDING_REVIEW' },
    });
    if (pending > 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'ONBOARDING_INCOMPLETE',
        `${pending} raw detections are still pending review`,
      );
    }

    return prisma.facility.update({
      where: { facility_id: facilityId },
      data: { onboarding_status: 'COMPLETED', onboarding_step: 8 },
    });
  }

  /**
   * Re-aligns every ParkingSlot's zone_id to match its primary camera's zone_id.
   * Run this once if slots were accidentally confirmed into the wrong zone.
   */
  static async realignSlotZones(facilityId: number) {
    const slots = await prisma.parkingSlot.findMany({
      where: { facility_id: facilityId, primary_camera_id: { not: null } },
      include: { primary_camera: { select: { zone_id: true } } },
    });

    let fixed = 0;
    for (const slot of slots) {
      const correctZoneId = slot.primary_camera?.zone_id ?? null;
      if (correctZoneId !== null && correctZoneId !== slot.zone_id) {
        await prisma.parkingSlot.update({
          where: { slot_id: slot.slot_id },
          data: { zone_id: correctZoneId },
        });
        fixed++;
      }
    }
    return { fixed, total: slots.length };
  }

  static async getSummary(facilityId: number) {
    const facility = await prisma.facility.findUnique({ where: { facility_id: facilityId } });
    if (!facility) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Facility not found');

    const [zoneCount, cameras, gates, slots] = await Promise.all([
      prisma.zone.count({ where: { facility_id: facilityId } }),
      prisma.camera.findMany({ where: { facility_id: facilityId } }),
      prisma.gate.findMany({ where: { facility_id: facilityId }, include: { camera: true } }),
      prisma.parkingSlot.findMany({
        where: { facility_id: facilityId },
        select: { slot_id: true, primary_camera_id: true, slot_code: true },
      }),
    ]);

    const slotsPerCamera = cameras
      .filter((c) => c.camera_type === 'PARKING_SLOT_CAM')
      .map((c) => ({
        camera_id: c.camera_id,
        name: c.name,
        confirmedSlots: slots.filter((s) => s.primary_camera_id === c.camera_id).length,
      }));

    return {
      facility,
      zoneCount,
      confirmedSlotCount: slots.length,
      slotsPerCamera,
      gateCount: gates.length,
      gates,
      pricing: {
        hourly_rate: facility.hourly_rate,
        currency: facility.currency,
        grace_period_minutes: facility.grace_period_minutes,
        minimum_fee: facility.minimum_fee,
      },
    };
  }

  private static async requireInProgress(facilityId: number) {
    const facility = await prisma.facility.findUnique({ where: { facility_id: facilityId } });
    if (!facility) throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Facility not found');
    if (facility.onboarding_status === 'COMPLETED') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_STATE', 'Onboarding is already complete');
    }
    return facility;
  }

  private static async requirePending(id: number, facilityId: number) {
    const detection = await prisma.rawSlotDetection.findUnique({ where: { detection_id: id } });
    if (!detection || detection.facility_id !== facilityId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Detection not found');
    }
    if (detection.status !== 'PENDING_REVIEW') {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_STATE', 'Detection is no longer pending review');
    }
    return detection;
  }

  private static async setStep(facilityId: number, step: number) {
    const facility = await prisma.facility.findUnique({ where: { facility_id: facilityId } });
    if (!facility) return;
    if (facility.onboarding_step < step) {
      await prisma.facility.update({
        where: { facility_id: facilityId },
        data: { onboarding_step: step, onboarding_status: 'IN_PROGRESS' },
      });
    }
  }

  private static async maybeAdvanceReviewStep(facilityId: number) {
    const pending = await prisma.rawSlotDetection.count({
      where: { facility_id: facilityId, status: 'PENDING_REVIEW' },
    });
    if (pending === 0) await this.setStep(facilityId, 5);
  }
}
