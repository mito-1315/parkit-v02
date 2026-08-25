import { z } from 'zod';
<<<<<<< HEAD
import { GateType, GateStatus } from '../enums';
=======
import { GateType, GateStatus } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const createGateSchema = z.object({
  body: z.object({
    facility_id: z.number().int(),
    camera_id: z.number().int().optional().nullable(),
    name: z.string().min(2),
    gate_type: z.nativeEnum(GateType),
    qr_code: z.string().min(2),
    location_description: z.string().optional().nullable(),
    status: z.nativeEnum(GateStatus).optional(),
  }),
});

export const updateGateSchema = z.object({
  body: z.object({
    camera_id: z.number().int().optional().nullable(),
    name: z.string().min(2).optional(),
    gate_type: z.nativeEnum(GateType).optional(),
    qr_code: z.string().min(2).optional(),
    location_description: z.string().optional().nullable(),
    status: z.nativeEnum(GateStatus).optional(),
  }),
});
