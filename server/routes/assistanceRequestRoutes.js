import express from 'express';
import { 
  createAssistanceRequest, 
  getAssistanceRequests, 
  getAssistanceRequestById 
} from '../controllers/assistanceRequestController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getAssistanceRequests);
router.get('/:id', getAssistanceRequestById);
router.post('/', protect, sanitizeContent, validateCategory, createAssistanceRequest);

export default router;
