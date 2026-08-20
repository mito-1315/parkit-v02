/**
 * Application-wide constants.
 * Keep environment-specific values in env.ts — only put truly static values here.
 */

/** HTTP status codes used throughout the app */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/** Parking slot status values (must match Prisma schema enum) */
export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

/** Parking slot types */
export const SLOT_TYPE = {
  STANDARD: 'STANDARD',
  COMPACT: 'COMPACT',
  HANDICAPPED: 'HANDICAPPED',
  EV: 'EV',
  VIP: 'VIP',
} as const;

/** Admin user roles */
export const ADMIN_ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FACILITY_ADMIN: 'FACILITY_ADMIN',
  OPERATOR: 'OPERATOR',
} as const;

/** Parking session status values */
export const SESSION_STATUS = {
  RESERVED: 'RESERVED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

/** Alert severity levels */
export const ALERT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
