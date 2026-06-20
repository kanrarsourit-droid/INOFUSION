const rateLimit = require('express-rate-limit');

// 1. General API rate limiter (protects against DDoS-style flooding)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Authentication rate limiter (protects against brute-force login and spam signup)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/signup requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. OTP rate limiter (prevents SMS/Email billing exhaustion and flooding)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit to 5 OTP requests per window
  message: {
    success: false,
    message: 'Too many verification code requests. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 4. Password Reset rate limiter (prevents reset link spam)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit to 3 reset requests per window
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter,
  passwordResetLimiter
};
