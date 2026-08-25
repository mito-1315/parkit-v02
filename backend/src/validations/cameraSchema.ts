import { z } from 'zod';
<<<<<<< HEAD
import { CameraType, CameraStatus } from '../enums';
=======
import { CameraType, CameraStatus } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const createCameraSchema = z.object({
  body: z.object({
    facility_id: z.number().int(),
    zone_id: z.number().int().optional().nullable(),
    name: z.string().min(2),
    camera_type: z.nativeEnum(CameraType),
    stream_url: z.string().url().optional().nullable(),
    location_description: z.string().optional().nullable(),
    status: z.nativeEnum(CameraStatus).optional(),
  }),
});

export const updateCameraSchema = z.object({
  body: z.object({
    zone_id: z.number().int().optional().nullable(),
    name: z.string().min(2).optional(),
    camera_type: z.nativeEnum(CameraType).optional(),
    stream_url: z.string().url().optional().nullable(),
    location_description: z.string().optional().nullable(),
    status: z.nativeEnum(CameraStatus).optional(),
    empty_lot_image_url: z.string().optional().nullable(),
  }),
});
