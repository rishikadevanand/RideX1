const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { 
    type, 
    isActive, 
    status,
    page = 1, 
    limit = 10,
    sortBy = 'vehicleId',
    sortOrder = 'asc',
    search,
    nearLat,
    nearLng,
    maxDistance = 1000
  } = req.query;
  
  let query = {};
  
  if (type) {
    query.type = type;
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (status) {
    query['maintenance.status'] = status;
  }

  if (search) {
    query.$or = [
      { vehicleId: { $regex: search, $options: 'i' } },
      { 'driver.name': { $regex: search, $options: 'i' } }
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  let vehicles;

  // If location-based search
  if (nearLat && nearLng) {
    vehicles = await Vehicle.findNearLocation(
      parseFloat(nearLat), 
      parseFloat(nearLng), 
      parseInt(maxDistance)
    );
  } else {
    vehicles = await Vehicle.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  const total = await Vehicle.countDocuments(query);

  res.json({
    success: true,
    data: {
      vehicles,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  res.json({
    success: true,
    data: vehicle
  });
}));

// @route   POST /api/vehicles
// @desc    Create new vehicle (admin only)
// @access  Private (Admin)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('vehicleId').trim().notEmpty().withMessage('Vehicle ID is required'),
  body('type').isIn(['bus', 'metro', 'train']).withMessage('Invalid vehicle type'),
  body('capacity').isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),
  body('driver.name').optional().trim().notEmpty(),
  body('driver.phone').optional().trim().notEmpty(),
  body('driver.license').optional().trim().notEmpty(),
  body('maintenance.nextService').isISO8601().withMessage('Next service date is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Check if vehicle ID already exists
  const existingVehicle = await Vehicle.findOne({ vehicleId: req.body.vehicleId });
  if (existingVehicle) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle ID already exists'
    });
  }

  const vehicleData = {
    ...req.body,
    createdBy: req.user._id
  };

  const vehicle = new Vehicle(vehicleData);
  await vehicle.save();

  logger.info('Vehicle created', { 
    vehicleId: vehicle._id, 
    adminId: req.user._id, 
    vehicleId: vehicle.vehicleId 
  });

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: vehicle
  });
}));

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle (admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('capacity').optional().isInt({ min: 1, max: 1000 }),
  body('driver.name').optional().trim().notEmpty(),
  body('driver.phone').optional().trim().notEmpty(),
  body('driver.license').optional().trim().notEmpty(),
  body('maintenance.status').optional().isIn(['operational', 'maintenance', 'out_of_service'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  logger.info('Vehicle updated', { 
    vehicleId: vehicle._id, 
    adminId: req.user._id, 
    updates: req.body 
  });

  res.json({
    success: true,
    message: 'Vehicle updated successfully',
    data: vehicle
  });
}));

// @route   PUT /api/vehicles/:id/location
// @desc    Update vehicle location
// @access  Private (Driver/Admin)
router.put('/:id/location', [
  authenticateToken,
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { lat, lng, address } = req.body;
  
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  // Check if user is driver of this vehicle or admin
  if (req.user.role !== 'admin' && 
      vehicle.driver && 
      vehicle.driver.name !== `${req.user.firstName} ${req.user.lastName}`) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - not authorized to update this vehicle location'
    });
  }

  await vehicle.updateLocation(lat, lng, address);

  // Emit real-time location update
  const io = req.app.get('io');
  io.emit('vehicle:location', {
    vehicleId: vehicle._id,
    vehicleId: vehicle.vehicleId,
    location: vehicle.currentLocation,
    updatedBy: req.user._id
  });

  logger.logVehicle('location_update', vehicle._id, {
    lat,
    lng,
    address,
    updatedBy: req.user._id
  });

  res.json({
    success: true,
    message: 'Vehicle location updated',
    data: vehicle.currentLocation
  });
}));

// @route   PUT /api/vehicles/:id/maintenance
// @desc    Update vehicle maintenance status
// @access  Private (Admin)
router.put('/:id/maintenance', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['operational', 'maintenance', 'out_of_service']).withMessage('Invalid maintenance status'),
  body('nextService').optional().isISO8601().withMessage('Invalid next service date'),
  body('serviceRecord.type').optional().isIn(['routine', 'repair', 'inspection']),
  body('serviceRecord.description').optional().trim(),
  body('serviceRecord.cost').optional().isNumeric()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { status, nextService, serviceRecord } = req.body;
  
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  vehicle.maintenance.status = status;
  
  if (nextService) {
    vehicle.maintenance.nextService = new Date(nextService);
  }

  if (serviceRecord) {
    await vehicle.addServiceRecord(serviceRecord);
  }

  await vehicle.save();

  logger.logVehicle('maintenance_update', vehicle._id, {
    status,
    nextService,
    serviceRecord,
    updatedBy: req.user._id
  });

  res.json({
    success: true,
    message: 'Vehicle maintenance updated',
    data: vehicle.maintenance
  });
}));

// @route   GET /api/vehicles/stats/overview
// @desc    Get vehicle statistics (admin only)
// @access  Private (Admin)
router.get('/stats/overview', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const totalVehicles = await Vehicle.countDocuments();
  const activeVehicles = await Vehicle.countDocuments({ isActive: true });
  const operationalVehicles = await Vehicle.countDocuments({ 'maintenance.status': 'operational' });
  const vehiclesNeedingService = await Vehicle.findNeedingService();
  
  const vehiclesByType = await Vehicle.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  const vehiclesByStatus = await Vehicle.aggregate([
    { $group: { _id: '$maintenance.status', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      totalVehicles,
      activeVehicles,
      operationalVehicles,
      vehiclesNeedingService: vehiclesNeedingService.length,
      vehiclesByType,
      vehiclesByStatus
    }
  });
}));

// @route   GET /api/vehicles/needing-service
// @desc    Get vehicles needing service (admin only)
// @access  Private (Admin)
router.get('/needing-service', [authenticateToken, requireAdmin], asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.findNeedingService()
    .select('vehicleId type capacity maintenance driver')
    .sort({ 'maintenance.nextService': 1 });

  res.json({
    success: true,
    data: vehicles
  });
}));

module.exports = router;