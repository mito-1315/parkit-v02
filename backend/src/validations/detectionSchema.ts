import { z } from 'zod';
import { DetectionType, DetectedStatus } from '../enums';

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
