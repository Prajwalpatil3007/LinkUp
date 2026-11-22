import jwt from 'jsonwebtoken';
import { User, hashPassword, matchPassword } from '../models/User.js';
import { Profile } from '../models/Profile.js';

const signToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, roles, location, bio, skills, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const assignedRoles = Array.isArray(roles)
      ? roles.filter((role) => role !== 'Administrator')
      : [];
    if (!assignedRoles.length) assignedRoles.push('Student');

    // Generate avatar url with initials
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=176B87&color=ffffff&bold=true`;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: assignedRoles,
      location: location || '',
      bio: bio || '',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : []),
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()) : []),
      avatar
    });

    // Create user's profile
    await Profile.create({
      user: user._id,
      headline: `${assignedRoles[0]} enthusiastic about collaboration`,
      education: [],
      experience: [],
      expertise: user.skills || [],
      availability: 'Flexible',
      projectExperience: '',
      joinedCommunities: [],
      participationHistory: [],
      socialLinks: { github: '', linkedin: '', website: '' }
    });

    const token = signToken(user._id);

    const userObj = { ...user };
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to LinkUp.',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User does not exist.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
    }

    const isMatch = await matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    const userObj = { ...user };
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userObj
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login: ' + err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const userObj = { ...user };
    delete userObj.password;

    const profile = await Profile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      user: userObj,
      profile: profile || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    // In a live system with mailer, this would email a token. We return a friendly mock token for seamless verification.
    const resetToken = 'RESET-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000)
    });

    res.status(200).json({
      success: true,
      message: `Password reset instructions sent. For demonstration, your one-time reset code is: ${resetToken}`,
      resetToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    if (user.resetPasswordToken && user.resetPasswordToken !== resetToken) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
