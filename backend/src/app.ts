import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import router from './routes/index';

const app = express();

// ─── Core middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/static', express.static(path.join(__dirname, '../public')));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/', router);

// ─── Error handler (must be last) ───────────────────────────────────────────
app.use(errorHandler);

export default app;
