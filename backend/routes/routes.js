const express = require('express');
const Route = require('../models/Route');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/routes
// @desc    Get all routes
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { 
    transportType, 
    startLocation, 
    endLocation, 
    page = 1, 
    limit = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    search,
    features
  } = req.query;
  
  let query = { isActive: true };
  
  if (transportType) {
    query.transportType = transportType;
  }
  
  if (startLocation) {
    query['startLocation.name'] = { $regex: startLocation, $options: 'i' };
  }
  
  if (endLocation) {
    query['endLocation.name'] = { $regex: endLocation, $options: 'i' };
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'startLocation.name': { $regex: search, $options: 'i' } },
      { 'endLocation.name': { $regex: search, $options: 'i' } }
    ];
  }

  if (features) {
    const featureArray = features.split(',');
    query.features = { $in: featureArray };
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const routes = await Route.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Route.countDocuments(query);

  res.json({
    success: true,
    data: {
      routes,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/routes/:id
// @desc    Get single route
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: route
  });
}));

// @route   POST /api/routes
// @desc    Create new route (admin only)
// @access  Private (Admin)
router.post('/', [
  authenticateToken,
  require('express-validator').body('name').trim().notEmpty().withMessage('Route name is required'),
  require('express-validator').body('transportType').isIn(['bus', 'metro', 'train']).withMessage('Invalid transport type'),
  require('express-validator').body('startLocation.name').trim().notEmpty().withMessage('Start location name is required'),
  require('express-validator').body('endLocation.name').trim().notEmpty().withMessage('End location name is required'),
  require('express-validator').body('distance').isNumeric().withMessage('Distance must be a number'),
  require('express-validator').body('estimatedDuration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  require('express-validator').body('baseFare').isNumeric().withMessage('Base fare must be a number')
], asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const routeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const route = new Route(routeData);
  await route.save();

  logger.info('Route created', { 
    routeId: route._id, 
    adminId: req.user._id, 
    name: route.name 
  });

  res.status(201).json({
    success: true,
    message: 'Route created successfully',
    data: route
  });
}));

// @route   PUT /api/routes/:id
// @desc    Update route (admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  require('express-validator').body('name').optional().trim().notEmpty(),
  require('express-validator').body('transportType').optional().isIn(['bus', 'metro', 'train']),
  require('express-validator').body('distance').optional().isNumeric(),
  require('express-validator').body('estimatedDuration').optional().isInt({ min: 1 }),
  require('express-validator').body('baseFare').optional().isNumeric()
], asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const errors = require('express-validator').validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const route = await Route.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  logger.info('Route updated', { 
    routeId: route._id, 
    adminId: req.user._id, 
    updates: req.body 
  });

  res.json({
    success: true,
    message: 'Route updated successfully',
    data: route
  });
}));

// @route   DELETE /api/routes/:id
// @desc    Delete route (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const route = await Route.findById(req.params.id);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Soft delete - just deactivate
  route.isActive = false;
  await route.save();

  logger.info('Route deactivated', { 
    routeId: route._id, 
    adminId: req.user._id 
  });

  res.json({
    success: true,
    message: 'Route deactivated successfully'
  });
}));

// @route   GET /api/routes/stats/overview
// @desc    Get route statistics (admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const totalRoutes = await Route.countDocuments();
  const activeRoutes = await Route.countDocuments({ isActive: true });
  
  const routesByType = await Route.aggregate([
    { $group: { _id: '$transportType', count: { $sum: 1 } } }
  ]);

  const recentRoutes = await Route.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name transportType startLocation endLocation createdAt');

  res.json({
    success: true,
    data: {
      totalRoutes,
      activeRoutes,
      routesByType,
      recentRoutes
    }
  });
}));

module.exports = router;