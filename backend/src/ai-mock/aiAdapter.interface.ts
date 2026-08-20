/**
 * AiAdapter — the ONLY contract the rest of the system may depend on.
 *
 * Hard rule: no file outside src/ai-mock/ may import MockAiAdapter directly.
 * Everything depends on this interface, injected at construction/startup time.
 */

export interface SlotOccupancyReading {
  slotId: number;
  status: 'EMPTY' | 'OCCUPIED';
  confidence: number; // 0..1
}

export interface PlateReading {
  licensePlate: string;
  confidence: number;
  vehicleType?: string;
}

export interface BoxDetection {
  suggestedCode: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface AiAdapter {
  /**
   * Returns occupancy readings for all slots owned by the given camera
   * (`ParkingSlot.primary_camera_id`). Must also persist a Detection row
   * for each reading.
   */
  getSlotOccupancy(cameraId: number): Promise<SlotOccupancyReading[]>;

  /**
   * Returns a plate reading for an ANPR camera, or null if no vehicle visible.
   * Must also persist a Detection row when called.
   */
  detectPlate(cameraId: number, forcePlate?: string): Promise<PlateReading | null>;

  /**
   * Mock "run extraction on this camera's empty-lot image" — called once per
   * camera during onboarding. Implementations persist RawSlotDetection rows.
   */
  extractParkingBoxes(cameraId: number): Promise<BoxDetection[]>;

  /**
   * Mock "read the plate visible right now at this gate's camera" — called
   * on-demand when a Parker scans a gate QR code, NOT on a background timer.
   */
  detectPlateAtGate(
    gateId: number,
    forcePlate?: string,
  ): Promise<{ licensePlate: string; confidence: number } | null>;
}
