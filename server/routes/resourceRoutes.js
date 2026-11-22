import express from 'express';
import { 
  getResources, 
  createResource, 
  upvoteResource 
} from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getResources);
router.post('/', protect, sanitizeContent, validateCategory, createResource);
router.post('/:id/upvote', protect, upvoteResource);

export default router;
