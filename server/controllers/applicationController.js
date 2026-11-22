import { Application } from '../models/Application.js';
import { Opportunity } from '../models/Opportunity.js';
import { Notification } from '../models/Notification.js';

export const applyToOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const { message, relevantExperience } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide an application statement or note to the organizer.' });
    }

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    if (opportunity.status !== 'Open') {
      return res.status(400).json({ success: false, message: 'Applications for this opportunity are currently closed.' });
    }

    // Prevent duplicate applications
    const existing = await Application.findOne({
      opportunity: opportunityId,
      applicant: req.user._id
    });

    if (existing) {
      if (existing.status === 'Withdrawn') {
        // Can re-open if withdrawn
        const reopened = await Application.findByIdAndUpdate(existing._id, {
          status: 'Pending',
          message,
          relevantExperience: relevantExperience || '',
          appliedAt: new Date()
        }, { new: true });

        return res.status(200).json({
          success: true,
          message: 'Your application has been re-submitted successfully.',
          application: reopened
        });
      }

      return res.status(400).json({
        success: false,
        message: `You have already submitted an application for this opportunity. Current status: ${existing.status}`
      });
    }

    const application = await Application.create({
      opportunity: opportunityId,
      applicant: req.user._id,
      message,
      relevantExperience: relevantExperience || '',
      status: 'Pending',
      appliedAt: new Date()
    });

    // Notify the organizer
    await Notification.create({
      recipient: opportunity.organizer,
      sender: req.user._id,
      type: 'application',
      title: 'New Opportunity Application',
      message: `${req.user.name} applied for "${opportunity.title}".`,
      link: `/opportunities/${opportunity._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! The organizer will review your profile.',
      application
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('opportunity', 'title category type mode location status deadline organizer availablePositions')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOpportunityApplications = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const isOrganizer = opportunity.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('Administrator');

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only the organizer or an administrator can view applications.' });
    }

    const applications = await Application.find({ opportunity: req.params.id })
      .populate('applicant', 'name email roles avatar location skills bio')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const allowed = ['Pending', 'Approved', 'Rejected', 'Withdrawn', 'Completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const application = await Application.findById(req.params.id).populate('opportunity');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const opportunity = await Opportunity.findById(application.opportunity._id || application.opportunity);
    const isOrganizer = opportunity && opportunity.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('Administrator');

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this application status.' });
    }

    const updated = await Application.findByIdAndUpdate(req.params.id, {
      status,
      feedback: feedback || '',
      reviewedAt: new Date()
    }, { new: true });

    // Notify the applicant
    await Notification.create({
      recipient: application.applicant,
      sender: req.user._id,
      type: 'application',
      title: `Application Status: ${status}`,
      message: `Your application for "${opportunity?.title}" has been updated to "${status}".`,
      link: '/applications'
    });

    res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own applications.' });
    }

    if (application.status === 'Approved' || application.status === 'Completed') {
      return res.status(400).json({ success: false, message: `Cannot withdraw an application that is already marked as ${application.status}.` });
    }

    const updated = await Application.findByIdAndUpdate(req.params.id, { status: 'Withdrawn' }, { new: true });

    res.status(200).json({
      success: true,
      message: 'Application successfully withdrawn.',
      application: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
