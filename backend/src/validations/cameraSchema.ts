import { z } from 'zod';
import { CameraType, CameraStatus } from '../enums';

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
