import { z } from 'zod';
import { SlotType, SlotStatus } from '../enums';

export const createSlotSchema = z.object({
  body: z.object({
    facility_id: z.number().int(),
    slot_code: z.string().min(1),
    slot_type: z.nativeEnum(SlotType),
    status: z.nativeEnum(SlotStatus).optional(),
    coordinates: z.string().optional(),
    distance_from_gate: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateSlotSchema = z.object({
  body: z.object({
    slot_code: z.string().min(1).optional(),
    slot_type: z.nativeEnum(SlotType).optional(),
    coordinates: z.string().optional(),
    distance_from_gate: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateSlotStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(SlotStatus),
  }),
});
