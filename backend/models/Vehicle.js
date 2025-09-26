const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['bus', 'metro', 'train'],
    required: [true, 'Vehicle type is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [1000, 'Capacity cannot exceed 1000']
  },
  features: [{
    type: String,
    enum: ['wifi', 'ac', 'charging', 'wheelchair_accessible', 'priority_seating', 'entertainment']
  }],
  currentLocation: {
    coordinates: {
      lat: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      lng: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    address: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  driver: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Driver name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    license: {
      type: String,
      trim: true,
      uppercase: true
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative']
    }
  },
  maintenance: {
    lastService: {
      type: Date,
      default: Date.now
    },
    nextService: {
      type: Date,
      required: [true, 'Next service date is required']
    },
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'out_of_service'],
      default: 'operational'
    },
    serviceHistory: [{
      date: {
        type: Date,
        required: true
      },
      type: {
        type: String,
        enum: ['routine', 'repair', 'inspection'],
        required: true
      },
      description: {
        type: String,
        trim: true
      },
      cost: {
        type: Number,
        min: [0, 'Cost cannot be negative']
      }
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
vehicleSchema.index({ vehicleId: 1 });
vehicleSchema.index({ type: 1, isActive: 1 });
vehicleSchema.index({ 'maintenance.status': 1 });
vehicleSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// Virtual for vehicle status
vehicleSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.maintenance.status === 'out_of_service') return 'out_of_service';
  if (this.maintenance.status === 'maintenance') return 'maintenance';
  return 'operational';
});

// Method to update location
vehicleSchema.methods.updateLocation = function(lat, lng, address) {
  this.currentLocation = {
    coordinates: { lat, lng },
    lastUpdated: new Date(),
    address: address || this.currentLocation.address
  };
  return this.save();
};

// Method to check if vehicle needs service
vehicleSchema.methods.needsService = function() {
  return new Date() >= this.maintenance.nextService;
};

// Method to add service record
vehicleSchema.methods.addServiceRecord = function(serviceData) {
  this.maintenance.serviceHistory.push({
    date: new Date(),
    ...serviceData
  });
  return this.save();
};

// Static method to find vehicles by type
vehicleSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

// Static method to find vehicles near location
vehicleSchema.statics.findNearLocation = function(lat, lng, maxDistance = 1000) {
  return this.find({
    'currentLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Static method to find vehicles needing service
vehicleSchema.statics.findNeedingService = function() {
  return this.find({
    'maintenance.nextService': { $lte: new Date() },
    isActive: true
  });
};

module.exports = mongoose.model('Vehicle', vehicleSchema);