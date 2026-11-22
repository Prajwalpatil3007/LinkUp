import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const assistanceRequestSchema = {
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterType: { type: String, default: 'Individual Resident' }, // Individual Resident or Organization
  generalLocation: { type: String, required: true }, // Protects private home addresses
  requiredSkills: [{ type: String }],
  volunteersNeeded: { type: Number, default: 2 },
  preferredDate: { type: String, default: '' },
  preferredTime: { type: String, default: '' },
  urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  contactMethod: { type: String, default: 'In-app LinkUp Messaging' },
  status: { type: String, enum: ['Pending Review', 'Approved', 'Rejected', 'Completed'], default: 'Approved' },
  reviewNotes: { type: String, default: '' }
};

export const AssistanceRequest = createModel('AssistanceRequest', assistanceRequestSchema, 'assistanceRequests');
