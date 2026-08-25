import { z } from 'zod';
<<<<<<< HEAD
import { CameraType, GateType, SlotType } from '../enums';
=======
import { CameraType, GateType, SlotType } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const onboardingFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    pincode: z.string().min(4),
    contact_phone: z.string().min(5),
    contact_email: z.string().email(),
    admin: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      phone_number: z.string().optional(),
    }),
  }),
});

export const onboardingZonesSchema = z.object({
  body: z.object({
    zones: z
      .array(
        z.object({
          name: z.string().min(2),
          floor_level: z.number().int(),
          description: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const onboardingCamerasSchema = z.object({
  body: z.object({
    cameras: z
      .array(
        z.object({
          name: z.string().min(2),
          camera_type: z.nativeEnum(CameraType),
          zone_id: z.number().int().optional().nullable(),
          location_description: z.string().optional().nullable(),
        }),
      )
      .min(1),
  }),
});

export const markDuplicateSchema = z.object({
  body: z.object({
    duplicateOfId: z.number().int().positive().optional(),
    duplicate_of_id: z.number().int().positive().optional(),
  }).refine((b) => b.duplicateOfId || b.duplicate_of_id, {
    message: 'duplicateOfId is required',
  }),
});

export const confirmDetectionSchema = z.object({
  body: z.object({
    slotCode: z.string().min(1).optional(),
    slot_code: z.string().min(1).optional(),
    zoneId: z.number().int().positive().optional(),
    zone_id: z.number().int().positive().optional(),
    slotType: z.nativeEnum(SlotType).optional(),
    slot_type: z.nativeEnum(SlotType).optional(),
  }).refine((b) => (b.slotCode || b.slot_code) && (b.zoneId || b.zone_id) && (b.slotType || b.slot_type), {
    message: 'slotCode, zoneId and slotType are required',
  }),
});

export const onboardingGatesSchema = z.object({
  body: z.object({
    gates: z
      .array(
        z.object({
          name: z.string().min(2),
          gate_type: z.nativeEnum(GateType),
          camera_id: z.number().int().optional().nullable(),
          location_description: z.string().optional().nullable(),
        }),
      )
      .min(1),
  }),
});

export const onboardingPricingSchema = z.object({
  body: z.object({
    hourlyRate: z.number().nonnegative().optional(),
    hourly_rate: z.number().nonnegative().optional(),
    currency: z.string().min(1).optional(),
    gracePeriodMinutes: z.number().int().nonnegative().optional(),
    grace_period_minutes: z.number().int().nonnegative().optional(),
    minimumFee: z.number().nonnegative().optional(),
    minimum_fee: z.number().nonnegative().optional(),
  }),
});

export const confirmEntrySchema = z.object({
  body: z.object({
    licensePlate: z.string().min(1).optional(),
    license_plate: z.string().min(1).optional(),
    forcePlate: z.string().optional(),
  }).refine((b) => b.licensePlate || b.license_plate, {
    message: 'licensePlate is required',
  }),
});

export const scanExitSchema = z.object({
  body: z.object({
    sessionId: z.number().int().positive().optional(),
    session_id: z.number().int().positive().optional(),
    licensePlate: z.string().optional(),
    license_plate: z.string().optional(),
    forcePlate: z.string().optional(),
  }),
});

export const scanEntrySchema = z.object({
  body: z.object({
    forcePlate: z.string().optional(),
    qrCode: z.string().optional(),
    qr_code: z.string().optional(),
  }).optional(),
});
