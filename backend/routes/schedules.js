const express = require('express');
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Vehicle = require('../models/Vehicle');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/schedules
// @desc    Get schedules for a route
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { routeId, date, dayOfWeek, time, page = 1, limit = 10 } = req.query;
  
  if (!routeId) {
    return res.status(400).json({
      success: false,
      message: 'Route ID is required'
    });
  }

  let query = { route: routeId, isActive: true };
  
  if (dayOfWeek) {
    query.daysOfWeek = dayOfWeek;
  }

  if (time) {
    query.departureTime = { $gte: time };
  }

  const schedules = await Schedule.find(query)
    .populate('vehicle', 'vehicleId type capacity features driver')
    .populate('route', 'name transportType startLocation endLocation')
    .sort({ departureTime: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter by date if provided
  let filteredSchedules = schedules;
  if (date) {
    const targetDate = new Date(date);
    const targetDayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    filteredSchedules = schedules.filter(schedule => 
      schedule.daysOfWeek.includes(targetDayOfWeek) ||
      schedule.specialDates.some(sd => 
        sd.date.toDateString() === targetDate.toDateString()
      )
    );
  }

  const total = await Schedule.countDocuments(query);

  res.json({
    success: true,
    data: {
      schedules: filteredSchedules,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// @route   GET /api/schedules/:id
// @desc    Get single schedule
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('vehicle', 'vehicleId type capacity features driver maintenance')
    .populate('route', 'name transportType startLocation endLocation baseFare features');
  
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.json({
    success: true,
    data: schedule
  });
}));

// @route   POST /api/schedules
// @desc    Create new schedule (admin only)
// @access  Private (Admin)
router.post('/', [
  authenticateToken,
  body('route').isMongoId().withMessage('Valid route ID is required'),
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('departureTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid departure time format'),
  body('arrivalTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid arrival time format'),
  body('daysOfWeek').isArray({ min: 1 }).withMessage('At least one day of week is required'),
  body('daysOfWeek.*').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('frequency').optional().isIn(['daily', 'weekdays', 'weekends', 'custom'])
], asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  // Verify route exists
  const route = await Route.findById(req.body.route);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Verify vehicle exists
  const vehicle = await Vehicle.findById(req.body.vehicle);
  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  const scheduleData = {
    ...req.body,
    createdBy: req.user._id
  };

  const schedule = new Schedule(scheduleData);
  await schedule.save();

  await schedule.populate([
    { path: 'vehicle', select: 'vehicleId type capacity features' },
    { path: 'route', select: 'name transportType startLocation endLocation' }
  ]);

  logger.info('Schedule created', { 
    scheduleId: schedule._id, 
    adminId: req.user._id, 
    routeId: req.body.route 
  });

  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: schedule
  });
}));

// @route   PUT /api/schedules/:id
// @desc    Update schedule (admin only)
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  body('departureTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('arrivalTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('daysOfWeek').optional().isArray(),
  body('daysOfWeek.*').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('frequency').optional().isIn(['daily', 'weekdays', 'weekends', 'custom'])
], asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'vehicle', select: 'vehicleId type capacity features' },
    { path: 'route', select: 'name transportType startLocation endLocation' }
  ]);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  logger.info('Schedule updated', { 
    scheduleId: schedule._id, 
    adminId: req.user._id, 
    updates: req.body 
  });

  res.json({
    success: true,
    message: 'Schedule updated successfully',
    data: schedule
  });
}));

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const schedule = await Schedule.findById(req.params.id);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Soft delete - just deactivate
  schedule.isActive = false;
  await schedule.save();

  logger.info('Schedule deactivated', { 
    scheduleId: schedule._id, 
    adminId: req.user._id 
  });

  res.json({
    success: true,
    message: 'Schedule deactivated successfully'
  });
}));

// @route   GET /api/schedules/route/:routeId/available-seats
// @desc    Get available seats for a schedule on a specific date
// @access  Public
router.get('/route/:routeId/available-seats', optionalAuth, asyncHandler(async (req, res) => {
  const { routeId } = req.params;
  const { scheduleId, date } = req.query;

  if (!scheduleId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Schedule ID and date are required'
    });
  }

  const schedule = await Schedule.findById(scheduleId).populate('vehicle');
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Get booked seats for this schedule and date
  const Booking = require('../models/Booking');
  const bookedSeats = await Booking.find({
    schedule: scheduleId,
    travelDate: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('seatNumber');

  const bookedSeatNumbers = bookedSeats.map(booking => booking.seatNumber);
  const totalSeats = schedule.vehicle.capacity;
  const availableSeats = [];

  for (let i = 1; i <= totalSeats; i++) {
    const seatNumber = `Seat ${i}`;
    if (!bookedSeatNumbers.includes(seatNumber)) {
      availableSeats.push(seatNumber);
    }
  }

  res.json({
    success: true,
    data: {
      totalSeats,
      availableSeats,
      bookedSeats: bookedSeatNumbers,
      availableCount: availableSeats.length,
      bookedCount: bookedSeatNumbers.length
    }
  });
}));

module.exports = router;