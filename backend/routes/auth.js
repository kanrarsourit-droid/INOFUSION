const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const redisClient = require('../config/redisClient');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { authLimiter, otpLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Generate and configure HTTP-only secure cookies and tokens
const sendTokenResponse = async (user, statusCode, req, res) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'supersecret_mediroute_jwt_token_key_123!',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'supersecret_mediroute_jwt_refresh_token_key_abc987!',
    { expiresIn: '7d' }
  );

  // Store refresh token in Redis (7 days = 604800s)
  await redisClient.setEx(`refresh_token:${user._id}:${refreshToken}`, 604800, 'active');

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  });

  res.status(statusCode).json({
    success: true,
    token: accessToken, // Retained for frontend headers fallback
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @route   POST /api/auth/signup
// @desc    Register a user
// @access  Public
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient'
    });

    // Send Welcome Email
    await emailService.sendWelcomeEmail(user.email, user.name);

    // Log user creation
    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `User registered successfully with role '${user.role}'`
    });

    await sendTokenResponse(user, 201, req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await AuditLog.create({
        email,
        action: 'LOGIN_FAILURE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Failed login attempt: Email not found.'
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await AuditLog.create({
        userId: user._id,
        email: user.email,
        action: 'LOGIN_FAILURE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Failed login attempt: Password mismatch.'
      });
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Log successful login
    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Successful standard password login.'
    });

    await sendTokenResponse(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/refresh
// @desc    Rotate access token using refresh token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token not found.' });
    }

    // Verify token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'supersecret_mediroute_jwt_refresh_token_key_abc987!'
    );

    // Verify refresh token is active in Redis
    const status = await redisClient.get(`refresh_token:${decoded.id}:${refreshToken}`);
    if (!status || status !== 'active') {
      return res.status(401).json({ success: false, message: 'Session expired or token revoked.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'supersecret_mediroute_jwt_token_key_123!',
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token: accessToken
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & revoke token
// @access  Private (but allowed Public fallback check)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    let userId = null;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || 'supersecret_mediroute_jwt_refresh_token_key_abc987!'
        );
        userId = decoded.id;
        
        // Revoke the token in Redis
        await redisClient.del(`refresh_token:${decoded.id}:${refreshToken}`);
      } catch (err) {
        // Suppress decode error on expired logout tokens
      }
    }

    // Log successful logout
    if (userId) {
      const user = await User.findById(userId);
      await AuditLog.create({
        userId,
        email: user ? user.email : null,
        action: 'LOGOUT',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'User successfully logged out. Refresh token revoked.'
      });
    }

    // Clear cookies
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset link
// @access  Public
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash token and set expiry
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Reset URL structure
    const resetUrl = `${req.protocol}://${req.get('host').includes('localhost') ? 'localhost:3000' : req.get('host')}/reset-password/${resetToken}`;

    // Send reset email
    const emailRes = await emailService.sendResetEmail(user.email, user.name, resetUrl);

    if (!emailRes.success) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent.' });
    }

    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'PASSWORD_RESET_REQUEST',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Password reset link requested.'
    });

    res.json({ success: true, message: 'Password reset email dispatched.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', passwordResetLimiter, async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'PASSWORD_RESET_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Password successfully updated via reset link.'
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change logged-in user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'PASSWORD_CHANGE',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'User password successfully changed.'
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/send-otp
// @desc    Request validation OTP code
// @access  Public
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email, phone, name } = req.body;

    if (email) {
      const resOtp = await otpService.sendEmailOtp(email, name);
      if (!resOtp.success) {
        return res.status(400).json({ success: false, message: resOtp.message });
      }

      await AuditLog.create({
        email,
        action: 'OTP_GENERATION',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Email OTP verification code generated.'
      });

      return res.json({ success: true, message: 'Email verification code sent.' });
    } else if (phone) {
      const resOtp = await otpService.sendPhoneOtp(phone);
      if (!resOtp.success) {
        return res.status(400).json({ success: false, message: resOtp.message });
      }

      await AuditLog.create({
        details: `SMS OTP code dispatched to phone: ${phone}`,
        action: 'OTP_GENERATION',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return res.json({ success: true, message: 'Phone verification code sent.' });
    }

    res.status(400).json({ success: false, message: 'Please specify an email or phone for verification.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Confirm validation OTP code
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (email) {
      const isVerified = await otpService.verifyOtp('email', email, otp);
      if (!isVerified) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
      }

      // Mark email as verified if user exists
      const user = await User.findOne({ email });
      if (user) {
        user.isEmailVerified = true;
        await user.save();
      }

      await AuditLog.create({
        userId: user ? user._id : null,
        email,
        action: 'OTP_VERIFICATION',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Email OTP code verified successfully.'
      });

      return res.json({ success: true, message: 'Email verified successfully.' });
    } else if (phone) {
      const isVerified = await otpService.verifyOtp('phone', phone, otp);
      if (!isVerified) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
      }

      const user = await User.findOne({ phone });
      if (user) {
        user.isPhoneVerified = true;
        await user.save();
      }

      await AuditLog.create({
        userId: user ? user._id : null,
        action: 'OTP_VERIFICATION',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `SMS OTP verified successfully for phone: ${phone}`
      });

      return res.json({ success: true, message: 'Phone number verified successfully.' });
    }

    res.status(400).json({ success: false, message: 'Please specify target and code.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Google Sign-In Credential login (Frontend button callback helper)
// @access  Public
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Invalid Google payload' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'patient',
        isEmailVerified: true
      });
    }

    await AuditLog.create({
      userId: user._id,
      email: user.email,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: 'Logged in via Google credential verify'
    });

    await sendTokenResponse(user, 200, req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/google
// @desc    Redirect to Google SSO
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth Callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?auth_error=true', session: false }),
  async (req, res) => {
    try {
      // Re-use Token Response logic inside standard redirect
      const accessToken = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET || 'supersecret_mediroute_jwt_token_key_123!',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: req.user._id },
        process.env.JWT_REFRESH_SECRET || 'supersecret_mediroute_jwt_refresh_token_key_abc987!',
        { expiresIn: '7d' }
      );

      await redisClient.setEx(`refresh_token:${req.user._id}:${refreshToken}`, 604800, 'active');

      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      };

      res.cookie('refreshToken', refreshToken, cookieOptions);
      res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        expires: new Date(Date.now() + 15 * 60 * 1000)
      });

      // Log OAuth login event
      await AuditLog.create({
        userId: req.user._id,
        email: req.user.email,
        action: 'LOGIN_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: 'Logged in via Google Passport OAuth callback.'
      });

      // Redirect client to their dashboard
      res.redirect('http://localhost:3000/dashboard');
    } catch (err) {
      res.redirect('http://localhost:3000/login?auth_error=server_error');
    }
  }
);

module.exports = router;

