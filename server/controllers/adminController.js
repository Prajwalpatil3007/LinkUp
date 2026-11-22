import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Opportunity } from '../models/Opportunity.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Project } from '../models/Project.js';
import { Community } from '../models/Community.js';
import { Application } from '../models/Application.js';
import { Report } from '../models/Report.js';
import { Notification } from '../models/Notification.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const totalAssistanceRequests = await AssistanceRequest.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const pendingVerifications = await Organization.countDocuments({ verificationStatus: 'Pending' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOpportunities,
        totalAssistanceRequests,
        totalProjects,
        totalCommunities,
        totalApplications,
        totalOrganizations,
        pendingVerifications,
        pendingReports
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });

    res.status(200).json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.roles?.includes('Administrator')) {
      return res.status(400).json({ success: false, message: 'Cannot suspend an Administrator.' });
    }

    const updated = await User.findByIdAndUpdate(user._id, {
      isSuspended: !user.isSuspended
    }, { new: true });

    res.status(200).json({
      success: true,
      message: `User ${updated.isSuspended ? 'suspended' : 're-activated'} successfully.`,
      user: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOrganization = async (req, res) => {
  try {
    const { status, notes } = req.body; // 'Verified' or 'Rejected'
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Verified or Rejected.' });
    }

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const updated = await Organization.findByIdAndUpdate(org._id, {
      verificationStatus: status,
      verificationNotes: notes || `Verification ${status.toLowerCase()} by administrator.`
    }, { new: true });

    // Notify organization owner
    await Notification.create({
      recipient: org.createdBy,
      sender: req.user._id,
      type: 'verification',
      title: `Organization Verification: ${status}`,
      message: `Your organization "${org.name}" has been marked as ${status}.`,
      link: `/organizations/${org._id}`
    });

    res.status(200).json({
      success: true,
      message: `Organization successfully ${status.toLowerCase()}!`,
      organization: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'name email avatar').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, targetTitle, reason, details } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'targetType, targetId, and reason are required.' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      targetTitle: targetTitle || '',
      reason,
      details: details || '',
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will investigate promptly.',
      report
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'Dismissed' or 'Action Taken'
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const updated = await Report.findByIdAndUpdate(report._id, {
      status: status || 'Resolved',
      resolvedBy: req.user._id
    }, { new: true });

    res.status(200).json({
      success: true,
      message: 'Report status updated.',
      report: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
