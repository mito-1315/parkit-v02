import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';

/** Parse a route/query param as a positive integer, or throw 400. */
export function parseId(value: unknown, name = 'id'): number {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', `Invalid ${name}`);
  }
  return n;
}

export const sessionInclude = {
  vehicle: true,
  slot: { include: { zone: true } },
  facility: { select: { facility_id: true, name: true, address: true, currency: true, hourly_rate: true } },
  user: { select: { user_id: true, name: true, email: true } },
  entry_gate: { select: { gate_id: true, name: true, gate_type: true, qr_code: true } },
  exit_gate: { select: { gate_id: true, name: true, gate_type: true, qr_code: true } },
} as const;
