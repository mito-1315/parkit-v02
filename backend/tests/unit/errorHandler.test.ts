/**
 * Phase 0 smoke test — verifies the Jest + ts-jest setup works and
 * that errorHandler emits the correct JSON shape.
 *
 * We use pure unit-test style (no HTTP server) by calling the middleware
 * directly with mock req/res/next objects.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError, errorHandler, ApiErrorResponse } from '../../src/middleware/errorHandler';
import { HTTP_STATUS } from '../../src/config/constants';

// ─── Mock response type ─────────────────────────────────────────────────────

interface MockResponse {
  statusCode: number;
  _body: unknown;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockReqRes() {
  const req = {} as Request;

  const mockRes: MockResponse = {
    statusCode: 200,
    _body: undefined as unknown,
    status(code: number): MockResponse {
      this.statusCode = code;
      return this;
    },
    json(body: unknown): MockResponse {
      this._body = body;
      return this;
    },
  };

  const res = mockRes as unknown as Response;
  const next: NextFunction = jest.fn();
  return { req, res, mockRes, next };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('errorHandler middleware', () => {
  it('handles AppError and returns correct JSON shape', () => {
    const { req, res, mockRes, next } = mockReqRes();
    const err = new AppError(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', 'Resource not found');

    errorHandler(err, req, res, next);

    expect(mockRes.statusCode).toBe(404);
    expect(mockRes._body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
  });

  it('includes details when AppError has details', () => {
    const { req, res, mockRes, next } = mockReqRes();
    const details = { field: 'email', issue: 'already taken' };
    const err = new AppError(HTTP_STATUS.CONFLICT, 'CONFLICT', 'Email already in use', details);

    errorHandler(err, req, res, next);

    const body = mockRes._body as ApiErrorResponse;
    expect(body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Email already in use',
        details,
      },
    });
  });

  it('handles ZodError and returns VALIDATION_ERROR shape', () => {
    const { req, res, mockRes, next } = mockReqRes();

    const schema = z.object({ name: z.string(), age: z.number() });
    let zodErr: ZodError | undefined;
    try {
      schema.parse({ name: 123, age: 'oops' });
    } catch (e) {
      zodErr = e as ZodError;
    }

    errorHandler(zodErr!, req, res, next);

    const body = mockRes._body as ApiErrorResponse;
    expect(mockRes.statusCode).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details).toBeDefined();
  });

  it('handles unknown errors with INTERNAL_SERVER_ERROR shape', () => {
    const { req, res, mockRes, next } = mockReqRes();

    errorHandler(new Error('something blew up'), req, res, next);

    const body = mockRes._body as ApiErrorResponse;
    expect(mockRes.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
