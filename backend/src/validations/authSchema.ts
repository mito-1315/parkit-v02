import { z } from 'zod';
import { AdminRole } from '@prisma/client';

export const userRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const adminRegisterSchema = z.object({
  body: z.object({
    facility_id: z.number().int().positive(),
    name: z.string().min(2),
    email: z.string().email(),
    phone_number: z.string().optional(),
    password: z.string().min(6),
    role: z.nativeEnum(AdminRole),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
