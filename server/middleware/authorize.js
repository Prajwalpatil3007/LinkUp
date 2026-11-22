export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role) || userRoles.includes('Administrator'));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRoles.join(', ')}' is not authorized to access this route.`
      });
    }

    next();
  };
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes('Administrator')) {
    return res.status(403).json({ success: false, message: 'Administrative privilege required.' });
  }
  next();
};
