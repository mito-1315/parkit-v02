import { z } from 'zod';

export const updateAdminUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone_number: z.string().optional(),
    // Email and role changes intentionally excluded from self-service update
  }),
});
