import { Opportunity } from '../models/Opportunity.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Notification } from '../models/Notification.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const getOpportunities = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      mode, 
      type, 
      location, 
      skill, 
      isAssistanceRequest, 
      urgency,
      sort, 
      status,
      limit
    } = req.query;

    let filter = {};

    // By default, show Open opportunities or if status specified
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'Open';
    }

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    if (mode && mode !== 'All') {
      filter.mode = mode;
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (isAssistanceRequest !== undefined) {
      filter.isAssistanceRequest = isAssistanceRequest === 'true';
    }

    let query = Opportunity.find(filter)
      .populate('organizer', 'name email roles avatar location')
      .populate('organization', 'name type verificationStatus logo');

    let opportunities = await query.exec();

    // Text Search
    if (search) {
      const q = search.toLowerCase();
      opportunities = opportunities.filter(op => 
        op.title.toLowerCase().includes(q) ||
        op.description.toLowerCase().includes(q) ||
        (op.location && op.location.toLowerCase().includes(q)) ||
        (op.skillsRequired && op.skillsRequired.some(s => s.toLowerCase().includes(q))) ||
        (op.organizer && op.organizer.name && op.organizer.name.toLowerCase().includes(q))
      );
    }

    // Location filter
    if (location) {
      const loc = location.toLowerCase();
      opportunities = opportunities.filter(op => op.location && op.location.toLowerCase().includes(loc));
    }

    // Skill filter
    if (skill) {
      const sk = skill.toLowerCase();
      opportunities = opportunities.filter(op => op.skillsRequired && op.skillsRequired.some(s => s.toLowerCase().includes(sk)));
    }

    // Urgency filter for assistance requests
    if (urgency && urgency !== 'All') {
      opportunities = opportunities.filter(op => op.assistanceDetails && op.assistanceDetails.urgency === urgency);
    }

    // Sorting
    if (sort === 'deadline') {
      opportunities.sort((a, b) => new Date(a.deadline || '2099') - new Date(b.deadline || '2099'));
    } else if (sort === 'oldest') {
      opportunities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: newest first
      opportunities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (limit) {
      opportunities = opportunities.slice(0, parseInt(limit));
    }

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('organizer', 'name email roles avatar location bio')
      .populate('organization', 'name description type verificationStatus logo website location contactEmail');

    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    // If it is an assistance request, load corresponding assistance request metadata
    let assistanceMeta = null;
    if (opportunity.isAssistanceRequest) {
      assistanceMeta = await AssistanceRequest.findOne({ opportunity: opportunity._id })
        .populate('requester', 'name avatar location');
    }

    res.status(200).json({
      success: true,
      opportunity,
      assistanceMeta
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      mode,
      location,
      skillsRequired,
      eligibility,
      startDate,
      endDate,
      deadline,
      availablePositions,
      contactInfo,
      organizationId,
      isAssistanceRequest,
      assistanceDetails
    } = req.body;

    if (!title || !description || !category || !type) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, category, and type.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      category,
      type,
      mode: mode || 'Online',
      location: location || (mode === 'Online' ? 'Remote / Online' : 'Local Community'),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
      eligibility: eligibility || 'Open to all interested participants',
      startDate: startDate || '',
      endDate: endDate || '',
      deadline: deadline || '',
      availablePositions: availablePositions ? parseInt(availablePositions) : 5,
      contactInfo: contactInfo || req.user.email,
      organizer: req.user._id,
      organization: organizationId || null,
      status: 'Open',
      isAssistanceRequest: !!isAssistanceRequest,
      assistanceDetails: assistanceDetails || {}
    });

    // If marked as assistance request, create linked AssistanceRequest entry
    if (isAssistanceRequest) {
      await AssistanceRequest.create({
        opportunity: opportunity._id,
        title,
        description,
        category,
        requester: req.user._id,
        requesterType: assistanceDetails?.requesterType || 'Individual Resident',
        generalLocation: location || 'Local Area',
        requiredSkills: opportunity.skillsRequired,
        volunteersNeeded: opportunity.availablePositions,
        preferredDate: startDate || '',
        preferredTime: assistanceDetails?.preferredTime || '',
        urgency: assistanceDetails?.urgency || 'Medium',
        contactMethod: contactInfo || 'LinkUp In-App Messaging',
        status: 'Approved'
      });
    }

    res.status(201).json({
      success: true,
      message: isAssistanceRequest ? 'Community Assistance Request published successfully!' : 'Opportunity published successfully!',
      opportunity
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    // Check ownership or admin
    const isOwner = opportunity.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('Administrator');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this opportunity.' });
    }

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully.',
      opportunity: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' });
    }

    const isOwner = opportunity.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('Administrator');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this opportunity.' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);
    await AssistanceRequest.deleteMany({ opportunity: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Opportunity removed successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
