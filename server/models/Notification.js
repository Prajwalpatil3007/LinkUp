import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';

const notificationSchema = {
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { 
    type: String, 
    enum: ['application', 'project', 'community', 'message', 'verification', 'system'], 
    default: 'system' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false }
};

export const Notification = createModel('Notification', notificationSchema, 'notifications');
