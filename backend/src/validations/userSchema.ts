import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone_number: z.string().optional(),
    // Email changes excluded — must go through a separate verify-email flow
  }),
});
