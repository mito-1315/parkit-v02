import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../config/constants';

/**
 * Standard error response shape used throughout the API:
 * { error: { code: string, message: string, details?: unknown } }
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Custom error class for operational errors (expected failures like 404, 403).
 * Thrown from controllers/services; caught here and serialised to JSON.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware.
 * Must be the LAST middleware registered in app.ts.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational (known) errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
    } satisfies ApiErrorResponse);
    return;
  }

  // Zod validation errors — surfaced from validateRequest middleware
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten().fieldErrors,
      },
    } satisfies ApiErrorResponse);
    return;
  }

  // Unknown / programming errors — log full stack, hide internals from client
  console.error('[errorHandler] Unhandled error:', err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  } satisfies ApiErrorResponse);
}
