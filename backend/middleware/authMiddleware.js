/**
 * Authentication & Role-Based Access Control Middleware
 * Enforces Customer and Administrator permissions on the server side.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in to continue.'
  });
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in with an administrator account.'
    });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges are required for this action.'
    });
  }
  req.user = req.session.user;
  return next();
}

module.exports = {
  requireAuth,
  requireAdmin
};
