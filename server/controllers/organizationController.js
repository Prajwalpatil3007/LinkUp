import { Organization } from '../models/Organization.js';
import { Opportunity } from '../models/Opportunity.js';
import { User } from '../models/User.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const getOrganizations = async (req, res) => {
  try {
    const { search, category, type, verificationStatus } = req.query;
    let filter = {};

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (verificationStatus) {
      filter.verificationStatus = verificationStatus;
    }

    let organizations = await Organization.find(filter).populate('createdBy', 'name email');

    if (search) {
      const q = search.toLowerCase();
      organizations = organizations.filter(o => 
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, count: organizations.length, organizations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('createdBy', 'name email roles avatar')
      .populate('members', 'name email roles avatar');

    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    // Load opportunities published by this organization
    const opportunities = await Opportunity.find({ organization: organization._id, status: 'Open' })
      .populate('organizer', 'name avatar');

    res.status(200).json({ success: true, organization, opportunities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const { name, description, category, type, website, location, contactEmail, contactPhone, logo } = req.body;

    if (!name || !description || !category || !type || !location || !contactEmail) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    const org = await Organization.create({
      name,
      description,
      category,
      type,
      website: website || '',
      location,
      contactEmail,
      contactPhone: contactPhone || '',
      logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=142B3B&color=ffffff&bold=true`,
      verificationStatus: 'Pending',
      createdBy: req.user._id,
      members: [req.user._id]
    });

    // Update user's organization ref
    await User.findByIdAndUpdate(req.user._id, { organization: org._id });

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully and submitted for verification!',
      organization: org
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitVerificationRequest = async (req, res) => {
  try {
    const { verificationDoc, verificationNotes } = req.body;
    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const isCreator = org.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.roles && req.user.roles.includes('Administrator');

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only organization managers can submit verification requests.' });
    }

    const updated = await Organization.findByIdAndUpdate(org._id, {
      verificationStatus: 'Pending',
      verificationDoc: verificationDoc || 'Govt Registration / Institutional Charter ID provided',
      verificationNotes: verificationNotes || 'Verification requested by organization representative.'
    }, { new: true });

    res.status(200).json({
      success: true,
      message: 'Verification documents submitted. Our administration team will review your organization profile.',
      organization: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
