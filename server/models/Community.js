import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const communitySchema = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // From 8 approved categories
  icon: { type: String, default: 'Users' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membersCount: { type: Number, default: 1 },
  rules: [{ type: String }],
  isPrivate: { type: Boolean, default: false }
};

export const Community = createModel('Community', communitySchema, 'communities');
