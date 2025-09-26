const express = require('express');
const mongoose = require('mongoose');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await checkDatabase(),
        memory: getMemoryUsage(),
        cpu: process.cpuUsage(),
        redis: await checkRedis()
      }
    };

    const isHealthy = health.services.database.status === 'connected';
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: health
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
}));

// @route   GET /api/health/detailed
// @desc    Detailed health check (admin only)
// @access  Private (Admin)
router.get('/detailed', [authenticateToken, require('../../middleware/auth').requireAdmin], asyncHandler(async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await getDetailedDatabaseInfo(),
        memory: getDetailedMemoryUsage(),
        cpu: getDetailedCPUUsage(),
        redis: await getDetailedRedisInfo(),
        disk: getDiskUsage()
      },
      collections: await getCollectionStats(),
      indexes: await getIndexStats()
    };

    const isHealthy = detailedHealth.services.database.status === 'connected';
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: detailedHealth
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(503).json({
      success: false,
      message: 'Detailed health check failed',
      error: error.message
    });
  }
}));

// Helper functions
async function checkDatabase() {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function checkRedis() {
  try {
    // Redis check would go here if Redis is implemented
    return {
      status: 'not_implemented',
      message: 'Redis not configured'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
  };
}

async function getDetailedDatabaseInfo() {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const db = mongoose.connection.db;
    const admin = db.admin();
    const serverStatus = await admin.serverStatus();
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      version: serverStatus.version,
      uptime: serverStatus.uptime,
      connections: serverStatus.connections
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

function getDetailedMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: {
      value: Math.round(usage.rss / 1024 / 1024),
      unit: 'MB',
      description: 'Resident Set Size'
    },
    heapTotal: {
      value: Math.round(usage.heapTotal / 1024 / 1024),
      unit: 'MB',
      description: 'Total heap size'
    },
    heapUsed: {
      value: Math.round(usage.heapUsed / 1024 / 1024),
      unit: 'MB',
      description: 'Used heap size'
    },
    external: {
      value: Math.round(usage.external / 1024 / 1024),
      unit: 'MB',
      description: 'External memory'
    },
    arrayBuffers: {
      value: Math.round(usage.arrayBuffers / 1024 / 1024),
      unit: 'MB',
      description: 'Array buffers'
    }
  };
}

function getDetailedCPUUsage() {
  const usage = process.cpuUsage();
  return {
    user: {
      value: usage.user,
      unit: 'microseconds',
      description: 'User CPU time'
    },
    system: {
      value: usage.system,
      unit: 'microseconds',
      description: 'System CPU time'
    }
  };
}

async function getDetailedRedisInfo() {
  try {
    // Redis detailed info would go here
    return {
      status: 'not_implemented',
      message: 'Redis not configured'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

function getDiskUsage() {
  try {
    // Disk usage would require additional packages like 'diskusage'
    return {
      status: 'not_implemented',
      message: 'Disk usage monitoring not implemented'
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
}

async function getCollectionStats() {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const stats = {};
    for (const collection of collections) {
      const collectionStats = await db.collection(collection.name).stats();
      stats[collection.name] = {
        count: collectionStats.count,
        size: collectionStats.size,
        avgObjSize: collectionStats.avgObjSize,
        storageSize: collectionStats.storageSize
      };
    }
    
    return stats;
  } catch (error) {
    return {
      error: error.message
    };
  }
}

async function getIndexStats() {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const indexStats = {};
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).listIndexes().toArray();
      indexStats[collection.name] = indexes.map(index => ({
        name: index.name,
        key: index.key,
        unique: index.unique || false,
        sparse: index.sparse || false
      }));
    }
    
    return indexStats;
  } catch (error) {
    return {
      error: error.message
    };
  }
}

module.exports = router;