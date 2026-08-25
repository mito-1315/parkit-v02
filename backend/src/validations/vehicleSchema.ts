import { z } from 'zod';
<<<<<<< HEAD
import { VehicleType } from '../enums';
=======
import { VehicleType } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

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
