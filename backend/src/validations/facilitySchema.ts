import { z } from 'zod';

export const createFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    pincode: z.string().min(4),
    contact_phone: z.string().min(5),
    contact_email: z.string().email(),
    total_slots: z.number().int().nonnegative(),
    is_active: z.boolean().optional(),
  }),
});

export const updateFacilitySchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    pincode: z.string().min(4).optional(),
    contact_phone: z.string().min(5).optional(),
    contact_email: z.string().email().optional(),
    total_slots: z.number().int().nonnegative().optional(),
    is_active: z.boolean().optional(),
  }),
});
