import { z } from 'zod';
import { VehicleType } from '@prisma/client';

export const createVehicleSchema = z.object({
  body: z.object({
    license_plate: z.string().min(2),
    vehicle_type: z.nativeEnum(VehicleType),
    make: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
  }),
});

export const updateVehicleSchema = z.object({
  body: z.object({
    license_plate: z.string().min(2).optional(),
    vehicle_type: z.nativeEnum(VehicleType).optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
  }),
});
