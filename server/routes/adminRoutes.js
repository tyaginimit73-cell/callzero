import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  getStats,
  getUsers,
  getCalls,
  suspendUser,
  unsuspendUser,
  getSystemHealth,
} from '../controllers/adminController.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/calls', getCalls);
router.get('/health', getSystemHealth);
router.post('/users/:id/suspend', suspendUser);
router.post('/users/:id/unsuspend', unsuspendUser);

export default router;
