import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const messageSchema = {
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  read: { type: Boolean, default: false }
};

export const Message = createModel('Message', messageSchema, 'messages');
