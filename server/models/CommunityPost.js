import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const communityMemberSchema = {
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Member', 'Moderator', 'Admin'], default: 'Member' },
  joinedAt: { type: Date, default: Date.now }
};

export const CommunityMember = createModel('CommunityMember', communityMemberSchema, 'communityMembers');

const communityPostSchema = {
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isAnnouncement: { type: Boolean, default: false }
};

export const CommunityPost = createModel('CommunityPost', communityPostSchema, 'communityPosts');
