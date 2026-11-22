import express from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  requestJoinProject, 
  handleJoinRequest 
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', protect, sanitizeContent, validateCategory, createProject);
router.post('/:id/join', protect, requestJoinProject);
router.put('/:id/requests/:requestId', protect, handleJoinRequest);

export default router;
