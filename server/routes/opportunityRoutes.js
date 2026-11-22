import express from 'express';
import { 
  getOpportunities, 
  getOpportunityById, 
  createOpportunity, 
  updateOpportunity, 
  deleteOpportunity 
} from '../controllers/opportunityController.js';
import { applyToOpportunity, getOpportunityApplications } from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);
router.post('/', protect, sanitizeContent, validateCategory, createOpportunity);
router.put('/:id', protect, sanitizeContent, validateCategory, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

// Application endpoints for this opportunity
router.post('/:id/apply', protect, applyToOpportunity);
router.get('/:id/applications', protect, getOpportunityApplications);

export default router;
