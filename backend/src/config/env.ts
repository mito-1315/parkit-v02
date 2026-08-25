import 'dotenv/config';
import { z } from 'zod';

/**
 * Zod schema for all required environment variables.
 * Fails fast at startup if any required variable is missing or has wrong type.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, { message: 'PORT must be a positive integer' }),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid PostgreSQL URL' }),
  JWT_ACCESS_SECRET: z.string().min(32, { message: 'JWT_ACCESS_SECRET must be at least 32 chars' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: 'JWT_REFRESH_SECRET must be at least 32 chars' }),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  MOCK_AI_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Typed, validated configuration object. Import this everywhere instead of
 * accessing process.env directly.
 */
export const config = parsed.data;

export type Config = typeof config;
