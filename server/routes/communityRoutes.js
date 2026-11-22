import express from 'express';
import { 
  getCommunities, 
  getCommunityById, 
  createCommunity, 
  joinCommunity, 
  leaveCommunity, 
  getCommunityPosts, 
  createCommunityPost, 
  likePost, 
  addComment 
} from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';
import { validateCategory, sanitizeContent } from '../middleware/validate.js';

const router = express.Router();

router.get('/', getCommunities);
router.get('/:id', getCommunityById);
router.post('/', protect, sanitizeContent, validateCategory, createCommunity);
router.post('/:id/join', protect, joinCommunity);
router.post('/:id/leave', protect, leaveCommunity);
router.get('/:id/posts', getCommunityPosts);
router.post('/:id/posts', protect, sanitizeContent, createCommunityPost);
router.post('/posts/:postId/like', protect, likePost);
router.post('/posts/:postId/comments', protect, sanitizeContent, addComment);

export default router;
