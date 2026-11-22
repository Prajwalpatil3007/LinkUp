import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const projectSchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // From 8 approved categories
  requiredSkills: [{ type: String }],
  teamSize: { type: Number, default: 4 },
  duration: { type: String, default: '3 months' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'Contributor' },
    joinedAt: { type: Date, default: Date.now }
  }],
  joinRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
  }],
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
  githubUrl: { type: String, default: '' }
};

export const Project = createModel('Project', projectSchema, 'projects');
