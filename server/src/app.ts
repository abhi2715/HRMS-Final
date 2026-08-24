import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { corsOptions } from './config/cors';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { morganStream } from './utils/logger';
import { sendError } from './utils/response';
import routes from './routes';

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render load balancer)

// ── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ── Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// ── Request Logging ─────────────────────────────────────────
app.use(morgan('combined', { stream: morganStream }));

// ── Rate Limiting ───────────────────────────────────────────
app.use('/api/', apiLimiter);
app.use('/api/v1/auth', authLimiter);

// ── API Routes ──────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, 'Route not found', 404, 'ROUTE_NOT_FOUND');
});

// ── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

export default app;
