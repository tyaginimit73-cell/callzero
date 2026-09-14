import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  markRead,
} from '../controllers/messageController.js';
import { validate } from '../middleware/validate.js';
import { messageSchema } from '../utils/schemas.js';

const router = Router();

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.get('/conversations/with/:userId', getOrCreateConversation);
router.post('/messages', validate(messageSchema), sendMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/conversations/:conversationId/read', markRead);

export default router;
