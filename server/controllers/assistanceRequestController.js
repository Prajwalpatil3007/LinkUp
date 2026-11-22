import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Opportunity } from '../models/Opportunity.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const createAssistanceRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      generalLocation,
      requiredSkills,
      volunteersNeeded,
      preferredDate,
      preferredTime,
      urgency,
      contactMethod,
      requesterType
    } = req.body;

    if (!title || !description || !category || !generalLocation) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, category, and general location.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    // 1. Create corresponding Opportunity entry (Unified listing rule)
    const opportunity = await Opportunity.create({
      title,
      description,
      category,
      type: 'Community Assistance Request',
      mode: 'Offline',
      location: generalLocation, // Generalized neighborhood / city to protect privacy
      skillsRequired: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      eligibility: 'Compassionate community volunteers and skilled students',
      startDate: preferredDate || '',
      availablePositions: volunteersNeeded ? parseInt(volunteersNeeded) : 2,
      contactInfo: contactMethod || 'Via LinkUp In-App Messages',
      organizer: req.user._id,
      status: 'Open',
      isAssistanceRequest: true,
      assistanceDetails: {
        urgency: urgency || 'Medium',
        requesterType: requesterType || (req.user.roles?.includes('NGO Representative') ? 'NGO Organization' : 'Individual Resident'),
        preferredDate: preferredDate || '',
        preferredTime: preferredTime || '',
        adminApproved: true
      }
    });

    // 2. Create detailed AssistanceRequest linked record
    const assistanceRequest = await AssistanceRequest.create({
      opportunity: opportunity._id,
      title,
      description,
      category,
      requester: req.user._id,
      requesterType: requesterType || (req.user.roles?.includes('NGO Representative') ? 'NGO Organization' : 'Individual Resident'),
      generalLocation,
      requiredSkills: opportunity.skillsRequired,
      volunteersNeeded: opportunity.availablePositions,
      preferredDate: preferredDate || '',
      preferredTime: preferredTime || '',
      urgency: urgency || 'Medium',
      contactMethod: contactMethod || 'LinkUp In-App Messaging',
      status: 'Approved'
    });

    res.status(201).json({
      success: true,
      message: 'Community assistance request submitted and live on the Explore Opportunities board!',
      assistanceRequest,
      opportunity
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssistanceRequests = async (req, res) => {
  try {
    const { category, urgency, status } = req.query;
    let filter = {};

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (urgency && urgency !== 'All') {
      filter.urgency = urgency;
    }
    if (status) {
      filter.status = status;
    }

    const requests = await AssistanceRequest.find(filter)
      .populate('requester', 'name avatar location roles')
      .populate('opportunity', 'title status availablePositions');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssistanceRequestById = async (req, res) => {
  try {
    const request = await AssistanceRequest.findById(req.params.id)
      .populate('requester', 'name avatar location roles bio')
      .populate('opportunity');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Assistance request not found.' });
    }

    res.status(200).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
