import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const organizationSchema = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // From 8 approved categories
  type: { type: String, required: true }, // NGO, Educational Institution, Startup / Business, Community Group
  website: { type: String, default: '' },
  location: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  logo: { type: String, default: '' },
  verificationStatus: { 
    type: String, 
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'], 
    default: 'Unverified' 
  },
  verificationNotes: { type: String, default: '' },
  verificationDoc: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
};

export const Organization = createModel('Organization', organizationSchema, 'organizations');
