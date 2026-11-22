import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const opportunitySchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // One of the 8 approved categories
  type: { type: String, required: true }, // Academic Project, Research Collaboration, Hackathon, Workshop, Community Assistance Request, NGO Volunteering, etc.
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Online' },
  location: { type: String, default: 'Remote / Online' },
  skillsRequired: [{ type: String }],
  eligibility: { type: String, default: 'Open to all interested participants' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  deadline: { type: String, default: '' },
  availablePositions: { type: Number, default: 5 },
  contactInfo: { type: String, default: '' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  status: { type: String, enum: ['Open', 'Closed', 'Under Review'], default: 'Open' },
  
  // Assistance Request specific integration (Unified collection requirement)
  isAssistanceRequest: { type: Boolean, default: false },
  assistanceDetails: {
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    requesterType: { type: String, default: 'Individual Resident' }, // Individual Resident or Organization
    preferredDate: { type: String, default: '' },
    preferredTime: { type: String, default: '' },
    beneficiaryGroup: { type: String, default: '' }, // e.g. Senior Citizens, Local School Students
    adminApproved: { type: Boolean, default: true }
  }
};

export const Opportunity = createModel('Opportunity', opportunitySchema, 'opportunities');
