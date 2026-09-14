import dotenv from 'dotenv';

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // WebRTC
  STUN_SERVER: process.env.STUN_SERVER || 'stun:stun.l.google.com:19302',
  TURN_SERVER: process.env.TURN_SERVER || '',
  TURN_USERNAME: process.env.TURN_USERNAME || '',
  TURN_PASSWORD: process.env.TURN_PASSWORD || '',

  // Rate limiting
  RATE_LIMIT_WINDOW: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 200,
};

// Fail fast in production if critical secrets are missing
if (env.NODE_ENV === 'production') {
  if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-only-insecure-secret-change-me') {
    throw new Error('JWT_SECRET must be set to a strong secret in production');
  }
  if (!env.CLIENT_URL) {
    throw new Error('CLIENT_URL must be set in production for CORS');
  }
}

export default env;
