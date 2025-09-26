const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'smart-ticket-backend',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Helper methods
logger.logRequest = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null
  });
};

logger.logError = (error, req = null) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user ? req.user._id : null
    })
  });
};

logger.logAuth = (action, userId, success, details = {}) => {
  logger.info('Authentication Event', {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logBooking = (action, bookingId, userId, details = {}) => {
  logger.info('Booking Event', {
    action,
    bookingId,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logVehicle = (action, vehicleId, details = {}) => {
  logger.info('Vehicle Event', {
    action,
    vehicleId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;