import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from '../utils/schemas.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

export default router;
