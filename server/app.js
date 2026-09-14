import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import env from './config/env.js';
import { corsOrigin } from './config/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { protect } from './middleware/auth.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import callRoutes from './routes/callRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// ---- Security headers ----
app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// ---- CORS ----
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---- Health check ----
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'ok', uptime: process.uptime(), time: new Date().toISOString() })
);

app.get('/api/config/rtc', protect, (req, res) =>
  res.json({
    success: true,
    data: {
      stun: env.STUN_SERVER,
      turn: env.TURN_SERVER
        ? {
            url: env.TURN_SERVER,
            username: env.TURN_USERNAME,
            credential: env.TURN_PASSWORD,
          }
        : null,
    },
  })
);

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/contacts', protect, contactRoutes);
app.use('/api', protect, messageRoutes);
app.use('/api/calls', protect, callRoutes);
app.use('/api/emergency-contacts', protect, emergencyRoutes);
app.use('/api/admin', adminRoutes);

// ---- Errors ----
app.use(notFound);
app.use(errorHandler);

export default app;
