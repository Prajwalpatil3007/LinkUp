import express from 'express';
import { 
  getAdminStats, 
  getAdminUsers, 
  toggleUserSuspension, 
  verifyOrganization, 
  getReports, 
  submitReport, 
  resolveReport 
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

// Public/authenticated users can submit reports
router.post('/reports', protect, submitReport);

// All other endpoints require Administrator role
router.get('/stats', protect, requireAdmin, getAdminStats);
router.get('/users', protect, requireAdmin, getAdminUsers);
router.put('/users/:id/suspend', protect, requireAdmin, toggleUserSuspension);
router.put('/organizations/:id/verify', protect, requireAdmin, verifyOrganization);
router.get('/reports', protect, requireAdmin, getReports);
router.put('/reports/:id/resolve', protect, requireAdmin, resolveReport);

export default router;
