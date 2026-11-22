import { Community } from '../models/Community.js';
import { CommunityMember } from '../models/CommunityMember.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { Profile } from '../models/Profile.js';
import { Notification } from '../models/Notification.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const getCommunities = async (req, res) => {
  try {
    const { search, category } = req.query;
    let filter = {};

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    let communities = await Community.find(filter).populate('creator', 'name avatar');

    if (search) {
      const q = search.toLowerCase();
      communities = communities.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, count: communities.length, communities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('creator', 'name avatar');
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    const members = await CommunityMember.find({ community: community._id }).populate('user', 'name avatar roles skills');
    
    // Check if current user is member
    let isMember = false;
    if (req.user) {
      isMember = members.some(m => (m.user?._id || m.user)?.toString() === req.user._id.toString());
    }

    res.status(200).json({ success: true, community, members, isMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunity = async (req, res) => {
  try {
    const { name, description, category, rules } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name, description, and category.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    const community = await Community.create({
      name,
      description,
      category,
      creator: req.user._id,
      membersCount: 1,
      rules: Array.isArray(rules) ? rules : (rules ? rules.split('\n').filter(r => r.trim()) : [
        'Be respectful and collaborative.',
        'Share knowledge and constructive feedback.',
        'No spam or irrelevant solicitations.'
      ])
    });

    // Add creator as Admin member
    await CommunityMember.create({
      community: community._id,
      user: req.user._id,
      role: 'Admin'
    });

    // Update profile joined communities
    await Profile.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    res.status(201).json({
      success: true,
      message: 'Community launched successfully!',
      community
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    const existingMember = await CommunityMember.findOne({
      community: community._id,
      user: req.user._id
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this community.' });
    }

    await CommunityMember.create({
      community: community._id,
      user: req.user._id,
      role: 'Member'
    });

    await Community.findByIdAndUpdate(community._id, {
      $inc: { membersCount: 1 }
    });

    await Profile.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      message: `You have joined "${community.name}". Welcome!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    await CommunityMember.deleteMany({
      community: community._id,
      user: req.user._id
    });

    await Community.findByIdAndUpdate(community._id, {
      $inc: { membersCount: -1 }
    });

    await Profile.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id }
    });

    res.status(200).json({
      success: true,
      message: `You have left "${community.name}".`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ community: req.params.id })
      .populate('author', 'name avatar roles')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityPost = async (req, res) => {
  try {
    const { title, content, tags, isAnnouncement } = req.body;
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found.' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const post = await CommunityPost.create({
      community: community._id,
      author: req.user._id,
      title,
      content,
      category: community.category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      likes: [],
      comments: [],
      isAnnouncement: !!isAnnouncement
    });

    res.status(201).json({
      success: true,
      message: 'Post shared in community!',
      post
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userIdStr = req.user._id.toString();
    const likes = post.likes || [];
    const index = likes.findIndex(id => (id._id || id).toString() === userIdStr);

    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(req.user._id);
    }

    await CommunityPost.findByIdAndUpdate(post._id, { likes });

    res.status(200).json({
      success: true,
      likesCount: likes.length,
      liked: index === -1
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = post.comments || [];
    comments.push({
      author: req.user._id,
      content,
      createdAt: new Date()
    });

    await CommunityPost.findByIdAndUpdate(post._id, { comments });

    res.status(201).json({
      success: true,
      message: 'Comment added.',
      comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
