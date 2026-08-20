import pinoHttp from 'pino-http';
import pino from 'pino';
import { config } from '../config/env';

/**
 * Pino logger instance — exported for use in services/controllers
 * that need to log outside of a request context.
 */
export const logger = pino({
  level: config.NODE_ENV === 'test' ? 'silent' : 'info',
  ...(config.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});

/**
 * pino-http middleware — attaches a unique request ID and structured
 * request/response log to every incoming HTTP request.
 * Register this early in app.ts (after cors, before routes).
 */
export const requestLogger = pinoHttp({
  logger,
  // Assign a request ID from the incoming header (for tracing) or generate one
  genReqId: (req) => {
    const existingId = req.headers['x-request-id'];
    return typeof existingId === 'string' ? existingId : crypto.randomUUID();
  },
  // Suppress logs for health-check endpoint to reduce noise
  autoLogging: {
    ignore: (req) => req.url === '/health',
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} → ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} → ${res.statusCode} — ${err.message}`,
});
