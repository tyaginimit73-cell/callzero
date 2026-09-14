import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export function setAuthCookie(res, token) {
  res.cookie('callzero_token', token, cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie('callzero_token', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax' });
}
