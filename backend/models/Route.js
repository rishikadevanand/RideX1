const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true,
    maxlength: [100, 'Route name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  transportType: {
    type: String,
    enum: ['bus', 'metro', 'train'],
    required: [true, 'Transport type is required']
  },
  startLocation: {
    name: {
      type: String,
      required: [true, 'Start location name is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Start location latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'Start location longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  endLocation: {
    name: {
      type: String,
      required: [true, 'End location name is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'End location latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'End location longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  stops: [{
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Stop latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        required: [true, 'Stop longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    order: {
      type: Number,
      required: [true, 'Stop order is required'],
      min: [1, 'Stop order must be at least 1']
    }
  }],
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance must be positive']
  },
  estimatedDuration: {
    type: Number,
    required: [true, 'Estimated duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  baseFare: {
    type: Number,
    required: [true, 'Base fare is required'],
    min: [0, 'Base fare must be non-negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    enum: ['wifi', 'ac', 'charging', 'wheelchair_accessible', 'priority_seating']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
routeSchema.index({ transportType: 1, isActive: 1 });
routeSchema.index({ 'startLocation.name': 1 });
routeSchema.index({ 'endLocation.name': 1 });
routeSchema.index({ name: 'text', description: 'text' });

// Virtual for full route name
routeSchema.virtual('fullRouteName').get(function() {
  return `${this.startLocation.name} to ${this.endLocation.name}`;
});

// Method to check if route is operational
routeSchema.methods.isOperational = function() {
  return this.isActive;
};

// Static method to find routes by transport type
routeSchema.statics.findByTransportType = function(transportType) {
  return this.find({ transportType, isActive: true });
};

// Static method to search routes
routeSchema.statics.searchRoutes = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { 'startLocation.name': { $regex: query, $options: 'i' } },
      { 'endLocation.name': { $regex: query, $options: 'i' } }
    ],
    isActive: true
  });
};

module.exports = mongoose.model('Route', routeSchema);