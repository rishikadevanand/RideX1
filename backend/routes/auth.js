const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens, authenticateRefreshToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  logger.logAuth('register', user._id, true, { email });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    logger.logAuth('login', null, false, { email, reason: 'User not found' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.logAuth('login', user._id, false, { email, reason: 'Invalid password' });
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    logger.logAuth('login', user._id, false, { email, reason: 'Account deactivated' });
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Update last login
  await user.updateLastLogin();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  logger.logAuth('login', user._id, true, { email });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
}));

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', authenticateRefreshToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Generate new tokens
  const tokens = generateTokens(req.user._id);

  // Update refresh token in database
  const user = await User.findById(req.user._id);
  user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
  user.refreshTokens.push({ token: tokens.refreshToken });
  await user.save();

  logger.logAuth('refresh', req.user._id, true);

  res.json({
    success: true,
    data: tokens
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
      await user.save();
    }
  }

  logger.logAuth('logout', req.user._id, true);

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshTokens = [];
  await user.save();

  logger.logAuth('logout_all', req.user._id, true);

  res.json({
    success: true,
    message: 'Logged out from all devices'
  });
}));

// @route   POST /api/auth/verify-email
// @desc    Verify email (stub implementation)
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('token').notEmpty()
], asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  // In a real implementation, you would verify the token
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // For demo purposes, just mark as verified
  user.isEmailVerified = true;
  await user.save();

  logger.logAuth('email_verification', user._id, true, { email });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (stub implementation)
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  }

  // In a real implementation, you would send an email with reset link
  logger.logAuth('password_reset_request', user._id, true, { email });

  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent'
  });
}));

// @route   POST /api/auth/reset-password
// @desc    Reset password (stub implementation)
// @access  Public
router.post('/reset-password', [
  body('email').isEmail().normalizeEmail(),
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], asyncHandler(async (req, res) => {
  const { email, token, password } = req.body;

  // In a real implementation, you would verify the token
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.password = password;
  await user.save();

  logger.logAuth('password_reset', user._id, true, { email });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

module.exports = router;