const crypto = require('crypto');
const redisClient = require('../config/redisClient');
const emailService = require('./emailService');
const smsService = require('./smsService');

// Generate 6-digit secure random numeric OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send and store an email OTP
 * @param {string} email 
 * @param {string} userName 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
const sendEmailOtp = async (email, userName) => {
  const throttleKey = `otp_throttle:email:${email}`;
  const rateLimitKey = `otp_rate:email:${email}`;

  // 1. Throttling: Check if request is within 60 seconds
  const isThrottled = await redisClient.get(throttleKey);
  if (isThrottled) {
    return { success: false, message: 'Please wait 60 seconds before requesting a new verification code.' };
  }

  // 2. Daily/Hourly limit: Max 5 requests per 10 minutes to prevent spam abuse
  const requestCountStr = await redisClient.get(rateLimitKey);
  let requestCount = requestCountStr ? parseInt(requestCountStr) : 0;
  if (requestCount >= 5) {
    return { success: false, message: 'Too many verification attempts. Please try again after 10 minutes.' };
  }

  const otp = generateOtp();
  const otpKey = `otp:email:${email}`;

  // Store OTP for 5 minutes (300s)
  await redisClient.setEx(otpKey, 300, otp);
  
  // Set throttle lock for 60s
  await redisClient.setEx(throttleKey, 60, '1');

  // Increment rate limits for 10 minutes (600s)
  await redisClient.setEx(rateLimitKey, 600, (requestCount + 1).toString());

  // Send the email
  const emailRes = await emailService.sendOtpEmail(email, userName, otp);
  if (!emailRes.success) {
    return { success: false, message: 'Failed to dispatch verification email.' };
  }

  return { success: true };
};

/**
 * Send and store a phone SMS OTP
 * @param {string} phone 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
const sendPhoneOtp = async (phone) => {
  const throttleKey = `otp_throttle:phone:${phone}`;
  const rateLimitKey = `otp_rate:phone:${phone}`;

  const isThrottled = await redisClient.get(throttleKey);
  if (isThrottled) {
    return { success: false, message: 'Please wait 60 seconds before requesting a new SMS verification.' };
  }

  const requestCountStr = await redisClient.get(rateLimitKey);
  let requestCount = requestCountStr ? parseInt(requestCountStr) : 0;
  if (requestCount >= 5) {
    return { success: false, message: 'SMS verification limit reached. Try again in 10 minutes.' };
  }

  const otp = generateOtp();
  const otpKey = `otp:phone:${phone}`;

  await redisClient.setEx(otpKey, 300, otp);
  await redisClient.setEx(throttleKey, 60, '1');
  await redisClient.setEx(rateLimitKey, 600, (requestCount + 1).toString());

  const smsRes = await smsService.sendSms(phone, `Your MediRoute AI verification code is: ${otp}. Valid for 5 minutes.`);
  if (!smsRes.success) {
    return { success: false, message: 'Failed to send verification SMS.' };
  }

  return { success: true };
};

/**
 * Verify a stored OTP
 * @param {string} type - 'email' or 'phone'
 * @param {string} target - Email address or Phone number
 * @param {string} enteredOtp 
 * @returns {Promise<boolean>}
 */
const verifyOtp = async (type, target, enteredOtp) => {
  if (!enteredOtp) return false;
  
  const otpKey = `otp:${type}:${target}`;
  const storedOtp = await redisClient.get(otpKey);

  if (storedOtp && storedOtp === enteredOtp.trim()) {
    // Delete verification OTP on successful verification to prevent reuse attacks
    await redisClient.del(otpKey);
    return true;
  }
  return false;
};

module.exports = {
  sendEmailOtp,
  sendPhoneOtp,
  verifyOtp
};
