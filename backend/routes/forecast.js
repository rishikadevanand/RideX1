const express = require('express');
const axios = require('axios');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/forecast/predict
// @desc    Get forecast predictions
// @access  Public
router.get('/predict', optionalAuth, asyncHandler(async (req, res) => {
  const { route, date, hour } = req.query;
  
  if (!route || !date) {
    return res.status(400).json({
      success: false,
      message: 'Route and date are required'
    });
  }

  const forecastServiceUrl = process.env.FORECAST_SERVICE_URL || 'http://localhost:5001';
  
  try {
    const response = await axios.get(`${forecastServiceUrl}/predict`, {
      params: { route, date, hour },
      timeout: 5000
    });

    logger.info('Forecast prediction requested', { route, date, hour, userId: req.user?._id });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('Forecast service error:', error.message);
    
    // Return mock data if forecast service is unavailable
    const mockData = {
      route,
      datetime: new Date(date),
      predicted_count: Math.floor(Math.random() * 50) + 10,
      capacity: 60,
      utilization_pct: Math.floor(Math.random() * 80) + 20,
      confidence: Math.floor(Math.random() * 30) + 70,
      explanation: [
        'Based on historical patterns for this route',
        'Weekend traffic typically shows 20% higher utilization',
        'Weather conditions may affect ridership'
      ]
    };

    res.json({
      success: true,
      data: mockData,
      note: 'Using mock data - forecast service unavailable'
    });
  }
}));

// @route   GET /api/forecast/routes/:routeId/analytics
// @desc    Get analytics for a specific route
// @access  Public
router.get('/routes/:routeId/analytics', optionalAuth, asyncHandler(async (req, res) => {
  const { routeId } = req.params;
  const { startDate, endDate } = req.query;

  const forecastServiceUrl = process.env.FORECAST_SERVICE_URL || 'http://localhost:5001';
  
  try {
    const response = await axios.get(`${forecastServiceUrl}/routes/${routeId}/analytics`, {
      params: { startDate, endDate },
      timeout: 5000
    });

    logger.info('Route analytics requested', { routeId, startDate, endDate, userId: req.user?._id });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('Analytics service error:', error.message);
    
    // Return mock analytics data
    const mockAnalytics = {
      routeId,
      period: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: endDate || new Date().toISOString().split('T')[0]
      },
      utilization: {
        average: 65,
        peak: 85,
        low: 35
      },
      heatmap: generateMockHeatmap(),
      trends: {
        weekly: generateMockWeeklyTrend(),
        hourly: generateMockHourlyTrend()
      },
      recommendations: [
        'Consider adding more vehicles during peak hours (7-9 AM, 5-7 PM)',
        'Route shows consistent high utilization on weekdays',
        'Weekend ridership is 40% lower than weekdays'
      ]
    };

    res.json({
      success: true,
      data: mockAnalytics,
      note: 'Using mock data - analytics service unavailable'
    });
  }
}));

// @route   GET /api/forecast/trends
// @desc    Get general forecasting trends
// @access  Public
router.get('/trends', optionalAuth, asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;
  
  // Mock trends data
  const trends = {
    period,
    overallTrend: 'increasing',
    peakHours: ['07:00-09:00', '17:00-19:00'],
    lowHours: ['10:00-16:00', '20:00-06:00'],
    seasonalFactors: {
      weekday: { multiplier: 1.2, description: 'Higher demand on weekdays' },
      weekend: { multiplier: 0.8, description: 'Lower demand on weekends' },
      holiday: { multiplier: 0.6, description: 'Reduced service during holidays' }
    },
    recommendations: [
      'Increase capacity during morning and evening rush hours',
      'Consider dynamic pricing for peak times',
      'Implement real-time capacity monitoring'
    ]
  };

  logger.info('Forecast trends requested', { period, userId: req.user?._id });

  res.json({
    success: true,
    data: trends
  });
}));

// Helper functions for mock data
function generateMockHeatmap() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return days.map(day => ({
    day,
    hours: hours.map(hour => ({
      hour,
      utilization: Math.floor(Math.random() * 100),
      bookings: Math.floor(Math.random() * 50) + 10
    }))
  }));
}

function generateMockWeeklyTrend() {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    utilization: Math.floor(Math.random() * 60) + 20,
    bookings: Math.floor(Math.random() * 100) + 20
  }));
}

function generateMockHourlyTrend() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    utilization: Math.floor(Math.random() * 80) + 10,
    bookings: Math.floor(Math.random() * 30) + 5
  }));
}

module.exports = router;