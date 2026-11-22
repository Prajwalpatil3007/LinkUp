import express from 'express';
import { 
  getOrganizations, 
  getOrganizationById, 
  createOrganization, 
  submitVerificationRequest 
} from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.post('/', protect, sanitizeContent, validateCategory, createOrganization);
router.post('/:id/verification', protect, submitVerificationRequest);

export default router;
