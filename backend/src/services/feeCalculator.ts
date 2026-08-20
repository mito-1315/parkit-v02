/**
 * Parking fee formula (onboarding / live session flow):
 *
 *   billableMinutes = max(0, durationMinutes - gracePeriodMinutes)
 *   fee             = max(minimumFee, ceil(billableMinutes / 60) * hourlyRate)
 *
 * Semantics chosen and tested: time inside the grace period still bills the
 * facility's `minimumFee` (which may be 0). A zero-duration session therefore
 * also equals `minimumFee`. Partial hours round up.
 */
export interface FeeInput {
  durationMinutes: number;
  gracePeriodMinutes: number;
  hourlyRate: number;
  minimumFee: number;
}

export function calculateParkingFee(input: FeeInput): number {
  const durationMinutes = Math.max(0, Number(input.durationMinutes) || 0);
  const gracePeriodMinutes = Math.max(0, Number(input.gracePeriodMinutes) || 0);
  const hourlyRate = Math.max(0, Number(input.hourlyRate) || 0);
  const minimumFee = Math.max(0, Number(input.minimumFee) || 0);

  const billableMinutes = Math.max(0, durationMinutes - gracePeriodMinutes);
  const billedHours = billableMinutes === 0 ? 0 : Math.ceil(billableMinutes / 60);
  const raw = billedHours * hourlyRate;
  return Math.max(minimumFee, raw);
}
