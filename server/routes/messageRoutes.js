import express from 'express';
import { 
  getConversations, 
  getMessagesBetweenUsers, 
  sendMessage 
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:partnerId', protect, getMessagesBetweenUsers);
router.post('/', protect, sendMessage);

export default router;
