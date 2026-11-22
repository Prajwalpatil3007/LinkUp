import express from 'express';
import { getUsers, getUserById, updateMe, getProfileByUserId, updateMyProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/me', protect, (req, res) => res.redirect('/api/auth/me'));
router.put('/me', protect, updateMe);
router.get('/:id', getUserById);
router.get('/profile/:userId', getProfileByUserId);
router.put('/profile/me', protect, updateMyProfile);

export default router;
