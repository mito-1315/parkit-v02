import { z } from 'zod';

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    floor_level: z.number().int(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    floor_level: z.number().int().optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});
