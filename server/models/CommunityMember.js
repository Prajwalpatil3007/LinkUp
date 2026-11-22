import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const communityMemberSchema = {
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Member', 'Moderator', 'Admin'], default: 'Member' },
  joinedAt: { type: Date, default: Date.now }
};

export const CommunityMember = createModel('CommunityMember', communityMemberSchema, 'communityMembers');
