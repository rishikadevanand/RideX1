const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const query = { user: req.user._id };
  
  if (status) {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(query)
    .populate('route', 'name transportType startLocation endLocation baseFare')
    .populate('schedule', 'departureTime arrivalTime daysOfWeek')
    .populate('vehicle', 'vehicleId type capacity features')
    .sort(sortOptions)
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

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('route', 'name transportType startLocation endLocation baseFare features')
    .populate('schedule', 'departureTime arrivalTime daysOfWeek')
    .populate('vehicle', 'vehicleId type capacity features driver')
    .populate('user', 'firstName lastName email phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking or is admin
  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: booking
  });
}));

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post('/', [
  authenticateToken,
  body('routeId').isMongoId().withMessage('Valid route ID is required'),
  body('scheduleId').isMongoId().withMessage('Valid schedule ID is required'),
  body('travelDate').isISO8601().withMessage('Valid travel date is required'),
  body('seatNumber').trim().notEmpty().withMessage('Seat number is required'),
  body('fare').isNumeric().withMessage('Fare must be a number'),
  body('passengerDetails.name').optional().trim().notEmpty(),
  body('passengerDetails.age').optional().isInt({ min: 0, max: 120 }),
  body('passengerDetails.gender').optional().isIn(['male', 'female', 'other']),
  body('specialRequests').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { 
    routeId, 
    scheduleId, 
    travelDate, 
    seatNumber, 
    fare, 
    specialRequests,
    passengerDetails 
  } = req.body;

  // Verify route exists
  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Verify schedule exists and belongs to route
  const schedule = await Schedule.findById(scheduleId)
    .populate('vehicle');
  if (!schedule || schedule.route.toString() !== routeId) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found or does not belong to this route'
    });
  }

  // Check if seat is already booked for this schedule and date
  const existingBooking = await Booking.findOne({
    schedule: scheduleId,
    travelDate: new Date(travelDate),
    seatNumber,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingBooking) {
    return res.status(409).json({
      success: false,
      message: 'Seat already booked',
      code: 'SEAT_OCCUPIED'
    });
  }

  // Create booking
  const booking = new Booking({
    user: req.user._id,
    route: routeId,
    schedule: scheduleId,
    vehicle: schedule.vehicle._id,
    travelDate: new Date(travelDate),
    seatNumber,
    fare,
    specialRequests,
    passengerDetails
  });

  await booking.save();

  // Populate the booking for response
  await booking.populate([
    { path: 'route', select: 'name transportType startLocation endLocation baseFare' },
    { path: 'schedule', select: 'departureTime arrivalTime daysOfWeek' },
    { path: 'vehicle', select: 'vehicleId type capacity features' }
  ]);

  // Emit real-time update
  const io = req.app.get('io');
  io.to(`route_${routeId}`).emit('booking:create', {
    booking: booking.toJSON()
  });

  logger.logBooking('create', booking._id, req.user._id, {
    routeId,
    scheduleId,
    seatNumber,
    fare
  });

  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: booking
  });
}));

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', [
  authenticateToken,
  body('reason').optional().trim()
], asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Cancel booking
  await booking.cancel(reason, req.user._id);

  // Populate for response
  await booking.populate([
    { path: 'route', select: 'name transportType' },
    { path: 'schedule', select: 'departureTime arrivalTime' },
    { path: 'vehicle', select: 'vehicleId type' }
  ]);

  // Emit real-time update
  const io = req.app.get('io');
  io.to(`route_${booking.route._id}`).emit('booking:cancel', {
    booking: booking.toJSON()
  });

  logger.logBooking('cancel', booking._id, req.user._id, { reason });

  res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
}));

// @route   PUT /api/bookings/:id/confirm
// @desc    Confirm booking
// @access  Private
router.put('/:id/confirm', authenticateToken, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await booking.confirm();

  logger.logBooking('confirm', booking._id, req.user._id);

  res.json({
    success: true,
    message: 'Booking confirmed successfully',
    data: booking
  });
}));

// @route   PUT /api/bookings/:id/check-in
// @desc    Check in for booking
// @access  Private
router.put('/:id/check-in', authenticateToken, asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check if user owns this booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await booking.checkIn();

  logger.logBooking('check_in', booking._id, req.user._id);

  res.json({
    success: true,
    message: 'Check-in successful',
    data: booking
  });
}));

// @route   GET /api/bookings/stats/overview
// @desc    Get booking statistics
// @access  Private
router.get('/stats/overview', authenticateToken, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter.travelDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const userBookings = await Booking.find({
    user: req.user._id,
    ...dateFilter
  });

  const stats = {
    total: userBookings.length,
    confirmed: userBookings.filter(b => b.status === 'confirmed').length,
    cancelled: userBookings.filter(b => b.status === 'cancelled').length,
    completed: userBookings.filter(b => b.status === 'completed').length,
    totalFare: userBookings.reduce((sum, b) => sum + b.fare, 0)
  };

  res.json({
    success: true,
    data: stats
  });
}));

module.exports = router;