import { Router } from 'express';
import {
  getContacts,
  getContactRequests,
  sendContactRequest,
  respondToRequest,
  removeContact,
  updateContact,
  blockAndRemove,
} from '../controllers/contactController.js';
import { validate } from '../middleware/validate.js';
import { contactRequestSchema, respondRequestSchema, contactUpdateSchema } from '../utils/schemas.js';

const router = Router();

router.get('/', getContacts);
router.get('/requests', getContactRequests);
router.post('/request', validate(contactRequestSchema), sendContactRequest);
router.post('/respond', validate(respondRequestSchema), respondToRequest);
router.patch('/:id', validate(contactUpdateSchema), updateContact);
router.delete('/:id', removeContact);
router.post('/:id/block', blockAndRemove);

export default router;
