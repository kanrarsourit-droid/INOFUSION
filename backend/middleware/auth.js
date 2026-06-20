const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Protect routes - verify access token from Authorization header or Cookies
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies as fallback
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Missing token.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_mediroute_jwt_token_key_123!');
    
    // Fetch user and append to request object
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      // Log unauthorized access
      await AuditLog.create({
        action: 'UNAUTHORIZED_ACCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Access token decoded validly, but user ID ${decoded.id} was not found in the database.`
      });
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    next();
  } catch (error) {
    // Log failed verification attempt
    await AuditLog.create({
      action: 'UNAUTHORIZED_ACCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `JWT Verification Failed: ${error.message}`
    });
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Invalid or expired token.' });
  }
};

// Grant access to specific roles (Role-Based Access Control)
const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User session not found.' });
    }

    // Role normalization: map legacy 'admin' to 'hospital_admin' if needed, or check exact roles
    const userRole = req.user.role;
    
    // Check if user's role is in the authorized roles list
    const hasRole = roles.includes(userRole) || 
                    (userRole === 'admin' && roles.includes('hospital_admin')) ||
                    (userRole === 'super_admin'); // Super admin overrides standard checks

    if (!hasRole) {
      // Log access denial event
      await AuditLog.create({
        userId: req.user._id,
        email: req.user.email,
        action: 'ACCESS_DENIED',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Access denied to path ${req.originalUrl}. Required roles: [${roles.join(', ')}]. User role: '${userRole}'.`
      });

      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

