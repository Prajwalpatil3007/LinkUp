import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const applicationSchema = {
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  relevantExperience: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Completed'], 
    default: 'Pending' 
  },
  feedback: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date }
};

export const Application = createModel('Application', applicationSchema, 'applications');
