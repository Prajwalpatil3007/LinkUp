import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const reportSchema = {
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['User', 'Opportunity', 'Community', 'Post'], required: true },
  targetId: { type: String, required: true },
  targetTitle: { type: String, default: '' },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Dismissed', 'Action Taken'], default: 'Pending' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
};

export const Report = createModel('Report', reportSchema, 'reports');
