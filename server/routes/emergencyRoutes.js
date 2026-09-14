import { Router } from 'express';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../controllers/emergencyController.js';
import { validate } from '../middleware/validate.js';
import { emergencySchema } from '../utils/schemas.js';

const router = Router();

router.get('/', getEmergencyContacts);
router.post('/', validate(emergencySchema), addEmergencyContact);
router.patch('/:id', validate(emergencySchema.partial()), updateEmergencyContact);
router.delete('/:id', deleteEmergencyContact);

export default router;
