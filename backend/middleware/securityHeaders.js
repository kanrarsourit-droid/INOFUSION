const mongoSanitize = require('express-mongo-sanitize');

// Custom HTML/XSS input sanitization function
const sanitizeInput = (val) => {
  if (typeof val === 'string') {
    // Strip HTML tags and dangerous scripts
    return val.replace(/<[^>]*>?/gm, '').replace(/javascript:/gi, '');
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeInput);
  }
  if (val !== null && typeof val === 'object') {
    const sanitizedObj = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        sanitizedObj[key] = sanitizeInput(val[key]);
      }
    }
    return sanitizedObj;
  }
  return val;
};

// Middleware to recursively sanitize request body, query params, and params
const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
};

// Strict CSRF Protection middleware utilizing custom header checks
// Browsers block cross-origin requests from setting custom headers (like X-Requested-With)
// or we can verify Origin and Referer header match the allowed origin
const csrfCheck = (req, res, next) => {
  // Safe methods do not modify state and are exempt from CSRF checks
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  // Verify that Origin or Referer matches the server host
  if (origin) {
    const cleanOrigin = origin.replace(/^https?:\/\//, '');
    if (cleanOrigin !== host && !cleanOrigin.startsWith('localhost:') && !cleanOrigin.startsWith('127.0.0.1:')) {
      return res.status(403).json({
        success: false,
        message: 'CSRF Alert: Request Origin is not authorized.'
      });
    }
  } else if (referer) {
    const cleanReferer = referer.replace(/^https?:\/\//, '').split('/')[0];
    if (cleanReferer !== host && !cleanReferer.startsWith('localhost:') && !cleanReferer.startsWith('127.0.0.1:')) {
      return res.status(403).json({
        success: false,
        message: 'CSRF Alert: Request Referer is not authorized.'
      });
    }
  }

  next();
};

// Express Mongo Sanitize config
const nosqlSanitizer = mongoSanitize({
  replaceWith: '_'
});

module.exports = {
  xssSanitizer,
  nosqlSanitizer,
  csrfCheck
};
