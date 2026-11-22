import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const resourceSchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // One of the 8 approved fields
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, default: '' },
  type: { type: String, enum: ['Article', 'Guide', 'Video / Tutorial', 'Code / Repository', 'Whitepaper / Report'], default: 'Article' },
  tags: [{ type: String }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featured: { type: Boolean, default: false }
};

export const Resource = createModel('Resource', resourceSchema, 'resources');
