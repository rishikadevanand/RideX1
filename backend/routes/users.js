const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  authenticateToken,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('preferences.language').optional().isIn(['en', 'ta']).withMessage('Invalid language'),
  body('preferences.notifications.email').optional().isBoolean(),
  body('preferences.notifications.sms').optional().isBoolean(),
  body('preferences.notifications.push').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, phone, preferences } = req.body;
  const updates = {};

  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone) updates.phone = phone;
  if (preferences) {
    updates.preferences = { ...req.user.preferences, ...preferences };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  logger.info('Profile updated', { userId: req.user._id, updates });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
}));

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 10, search } = req.query;
  
  let query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin)
router.get('/:id', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
}));

// @route   PUT /api/users/:id
// @desc    Update user by ID (admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('role').optional().isIn(['user', 'admin', 'driver']),
  body('isActive').optional().isBoolean(),
  body('isEmailVerified').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, phone, role, isActive, isEmailVerified } = req.body;
  const updates = {};

  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone) updates.phone = phone;
  if (role) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  if (isEmailVerified !== undefined) updates.isEmailVerified = isEmailVerified;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  logger.info('User updated by admin', { 
    adminId: req.user._id, 
    userId: req.params.id, 
    updates 
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user by ID (admin only)
// @access  Private (Admin)
router.delete('/:id', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete - just deactivate
  user.isActive = false;
  await user.save();

  logger.info('User deactivated by admin', { 
    adminId: req.user._id, 
    userId: req.params.id 
  });

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @route   GET /api/users/:id/bookings
// @desc    Get user bookings (admin or own bookings)
// @access  Private
router.get('/:id/bookings', [authenticateToken, requireOwnership], asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const Booking = require('../models/Booking');
  let query = { user: req.params.id };
  
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('route', 'name transportType startLocation endLocation')
    .populate('schedule', 'departureTime arrivalTime')
    .populate('vehicle', 'vehicleId type capacity')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Booking.countDocuments(query);

  res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private (Admin)
router.get('/stats/overview', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
  
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  const recentUsers = await User.find()
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersByRole,
      recentUsers
    }
  });
}));

module.exports = router;