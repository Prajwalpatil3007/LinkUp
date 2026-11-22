import { Resource } from '../models/Resource.js';
import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const getResources = async (req, res) => {
  try {
    const { category, type, search } = req.query;
    let filter = {};

    if (category && category !== 'All' && APPROVED_CATEGORIES.includes(category)) {
      filter.category = category;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }

    let resources = await Resource.find(filter).populate('author', 'name avatar roles');

    if (search) {
      const q = search.toLowerCase();
      resources = resources.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    res.status(200).json({ success: true, count: resources.length, resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const { title, description, category, url, type, tags } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and category.' });
    }

    if (!APPROVED_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${APPROVED_CATEGORIES.join(', ')}` });
    }

    const resource = await Resource.create({
      title,
      description,
      category,
      author: req.user._id,
      url: url || '',
      type: type || 'Article',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      upvotes: []
    });

    res.status(201).json({
      success: true,
      message: 'Resource published to LinkUp Knowledge Centre!',
      resource
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upvoteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const userIdStr = req.user._id.toString();
    const upvotes = resource.upvotes || [];
    const index = upvotes.findIndex(id => (id._id || id).toString() === userIdStr);

    if (index > -1) {
      upvotes.splice(index, 1);
    } else {
      upvotes.push(req.user._id);
    }

    await Resource.findByIdAndUpdate(resource._id, { upvotes });

    res.status(200).json({
      success: true,
      upvotesCount: upvotes.length,
      upvoted: index === -1
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
