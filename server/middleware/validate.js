import { APPROVED_CATEGORIES } from '../utils/constants.js';

export const validateCategory = (req, res, next) => {
  const category = req.body.category;
  if (category && !APPROVED_CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category '${category}'. Category must be one of the 8 approved fields: ${APPROVED_CATEGORIES.join(', ')}`
    });
  }
  next();
};

export const sanitizeContent = (req, res, next) => {
  // Guard against prohibited event types
  const prohibitedKeywords = [
    'ticket booking', 'concert', 'movie show', 'party night', 
    'sports tournament', 'cricket match', 'football league', 'gym workout', 'fashion show'
  ];

  const bodyStr = JSON.stringify(req.body).toLowerCase();
  for (const word of prohibitedKeywords) {
    if (bodyStr.includes(word)) {
      return res.status(400).json({
        success: false,
        message: `LinkUp policy restriction: Content related to '${word}' is not permitted. LinkUp focuses exclusively on academic, digital awareness, social service, community support, entrepreneurship, professional development, sustainability, financial literacy, and health.`
      });
    }
  }
  next();
};
