import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const getProjects = async (req, res) => {
  try {
    const { search, category, skill, status } = req.query;
    let filter = {};

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    let projects = await Project.find(filter)
      .populate('owner', 'name avatar location roles')
      .populate('members.user', 'name avatar roles');

    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.requiredSkills && p.requiredSkills.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (skill) {
      const sk = skill.toLowerCase();
      projects = projects.filter(p => p.requiredSkills && p.requiredSkills.some(s => s.toLowerCase().includes(sk)));
    }

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar location roles bio')
      .populate('members.user', 'name avatar roles skills bio')
      .populate('joinRequests.user', 'name avatar roles skills bio');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, category, requiredSkills, teamSize, duration, githubUrl } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide project title, description, and category.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    const project = await Project.create({
      title,
      description,
      category,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      teamSize: teamSize ? parseInt(teamSize) : 4,
      duration: duration || '3 months',
      githubUrl: githubUrl || '',
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'Project Lead',
        joinedAt: new Date()
      }],
      joinRequests: [],
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Collaborative project created successfully!',
      project
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const requestJoinProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const userIdStr = req.user._id.toString();

    // Check if already a member
    const isMember = (project.members || []).some(m => (m.user._id || m.user).toString() === userIdStr);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this project.' });
    }

    // Check if request already pending
    const existingReq = (project.joinRequests || []).find(r => (r.user._id || r.user).toString() === userIdStr);
    if (existingReq && existingReq.status === 'Pending') {
      return res.status(400).json({ success: false, message: 'You have already submitted a join request that is awaiting review.' });
    }

    const newRequest = {
      user: req.user._id,
      message: req.body.message || 'I would like to collaborate on this project.',
      requestedAt: new Date(),
      status: 'Pending'
    };

    const updated = await Project.findByIdAndUpdate(project._id, {
      $push: { joinRequests: newRequest }
    }, { new: true });

    // Notify project owner
    await Notification.create({
      recipient: project.owner,
      sender: req.user._id,
      type: 'project',
      title: 'New Project Join Request',
      message: `${req.user.name} requested to join project "${project.title}".`,
      link: `/projects/${project._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Join request sent to project lead.',
      project: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleJoinRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const { id, requestId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project lead can accept or reject join requests.' });
    }

    const reqItem = (project.joinRequests || []).find(r => r._id === requestId || r.id === requestId);
    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Join request not found.' });
    }

    reqItem.status = action === 'accept' ? 'Accepted' : 'Rejected';

    if (action === 'accept') {
      project.members.push({
        user: reqItem.user,
        role: 'Collaborator',
        joinedAt: new Date()
      });
    }

    await Project.findByIdAndUpdate(id, {
      members: project.members,
      joinRequests: project.joinRequests
    });

    // Notify user
    await Notification.create({
      recipient: reqItem.user,
      sender: req.user._id,
      type: 'project',
      title: action === 'accept' ? 'Project Join Request Accepted!' : 'Project Join Request Update',
      message: action === 'accept' 
        ? `You have been welcomed to the team of "${project.title}"!`
        : `Your request to join "${project.title}" was not accepted at this time.`,
      link: `/projects/${project._id}`
    });

    res.status(200).json({
      success: true,
      message: `Request ${action === 'accept' ? 'accepted' : 'rejected'}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
