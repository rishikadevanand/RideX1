const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');
const forecastController = require('./controllers/forecastController');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Forecasting service is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/predict', forecastController.predict);

app.get('/routes/:routeId/analytics', forecastController.getAnalytics);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Forecasting service error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.info(`Forecasting service running on port ${PORT}`);
});

module.exports = app;