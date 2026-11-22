import express from 'express';
import { 
  getMyApplications, 
  updateApplicationStatus, 
  withdrawApplication 
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyApplications);
router.put('/:id/status', protect, updateApplicationStatus);
router.put('/:id/withdraw', protect, withdrawApplication);

export default router;
