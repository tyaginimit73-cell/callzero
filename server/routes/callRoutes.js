import { Router } from 'express';
import { getCallHistory, getCallById, createCallRecord } from '../controllers/callController.js';

const router = Router();

router.get('/history', getCallHistory);
router.post('/', createCallRecord);
router.get('/:id', getCallById);

export default router;
