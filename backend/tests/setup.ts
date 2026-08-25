/**
 * Jest global setup — sets required environment variables before any test module is loaded.
 * This runs before ts-jest compiles test files, so env.ts Zod validation passes.
 */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://parking_user:parking_pass@localhost:5432/smart_parking_test';
process.env.PORT = '4099';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_that_is_at_least_32_chars_long!!';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars_long!';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.CORS_ORIGIN = 'http://localhost:5173';
