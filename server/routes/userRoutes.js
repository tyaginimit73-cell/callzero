import { Router } from 'express';
import {
  searchUsers,
  getUserById,
  updateProfile,
  blockUser,
  unblockUser,
} from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../utils/schemas.js';

const router = Router();

router.get('/search', searchUsers);
router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.post('/:id/block', blockUser);
router.post('/:id/unblock', unblockUser);
router.get('/:id', getUserById);

export default router;
