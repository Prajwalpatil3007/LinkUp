import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const profileSchema = {
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  headline: { type: String, default: '' },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String
  }],
  experience: [{
    title: String,
    organization: String,
    description: String,
    startYear: String,
    endYear: String
  }],
  expertise: [{ type: String }],
  availability: { type: String, default: 'Flexible' }, // Full-time, Part-time, Weekends, Flexible
  projectExperience: { type: String, default: '' },
  joinedCommunities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  participationHistory: [{
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    role: String,
    date: Date
  }],
  socialLinks: {
    github: String,
    linkedin: String,
    website: String
  }
};

export const Profile = createModel('Profile', profileSchema, 'profiles');
