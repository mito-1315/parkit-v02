import { z } from 'zod';
<<<<<<< HEAD
import { DetectionType, DetectedStatus } from '../enums';
=======
import { DetectionType, DetectedStatus } from '@prisma/client';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const createDetectionSchema = z.object({
  body: z.object({
    camera_id: z.number().int().positive(),
    slot_id: z.number().int().positive().optional(),
    gate_id: z.number().int().positive().optional(),
    detection_type: z.nativeEnum(DetectionType),
    detected_status: z.nativeEnum(DetectedStatus).optional(),
    license_plate_detected: z.string().optional(),
    confidence_score: z.number().min(0).max(1).optional(),
    bounding_box: z.string().optional(),
  }),
});
