const logger = require('../utils/logger');
const forecastService = require('../services/forecastService');

const predict = async (req, res) => {
  try {
    const { route, date, hour } = req.query;
    
    if (!route || !date) {
      return res.status(400).json({
        success: false,
        message: 'Route and date are required'
      });
    }

    logger.info(`Forecast request: route=${route}, date=${date}, hour=${hour}`);

    const prediction = await forecastService.getPrediction(route, date, hour);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prediction'
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { startDate, endDate } = req.query;

    logger.info(`Analytics request: routeId=${routeId}, startDate=${startDate}, endDate=${endDate}`);

    const analytics = await forecastService.getAnalytics(routeId, startDate, endDate);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};

module.exports = {
  predict,
  getAnalytics
};