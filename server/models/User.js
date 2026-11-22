import mongoose from 'mongoose';
import { createModel } from './modelFactory.js';
import bcrypt from 'bcryptjs';

const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  roles: [{ type: String, default: 'Student' }], // Students, Residents, Professionals, NGO, Educational Institution, Startup, Organiser, Admin
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  isSuspended: { type: Boolean, default: false },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
};

export const User = createModel('User', userSchema, 'users');

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
