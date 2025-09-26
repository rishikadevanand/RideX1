const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  travelDate: {
    type: Date,
    required: [true, 'Travel date is required'],
    min: [new Date(), 'Travel date cannot be in the past']
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required'],
    trim: true
  },
  fare: {
    type: Number,
    required: [true, 'Fare is required'],
    min: [0, 'Fare must be non-negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'wallet', 'cash', 'netbanking'],
    default: 'card'
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  qrCode: {
    type: String,
    unique: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  passengerDetails: {
    name: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    idNumber: {
      type: String,
      trim: true
    },
    idType: {
      type: String,
      enum: ['aadhar', 'passport', 'driving_license', 'pan']
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ route: 1, travelDate: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ travelDate: 1, status: 1 });
bookingSchema.index({ qrCode: 1 });
bookingSchema.index({ 'passengerDetails.idNumber': 1 });

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `ST${timestamp}${random}`.toUpperCase();
  }
  
  if (!this.qrCode) {
    this.qrCode = uuidv4();
  }
  
  next();
});

// Virtual for booking age
bookingSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for total amount (including any additional charges)
bookingSchema.virtual('totalAmount').get(function() {
  return this.fare; // Can be extended to include taxes, fees, etc.
});

// Method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  if (this.status === 'completed') {
    throw new Error('Cannot cancel completed booking');
  }
  
  if (this.status === 'cancelled') {
    throw new Error('Booking already cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  
  return this.save();
};

// Method to confirm booking
bookingSchema.methods.confirm = function() {
  if (this.status !== 'pending') {
    throw new Error('Only pending bookings can be confirmed');
  }
  
  this.status = 'confirmed';
  this.paymentStatus = 'paid';
  
  return this.save();
};

// Method to mark as completed
bookingSchema.methods.complete = function() {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be completed');
  }
  
  this.status = 'completed';
  this.checkOutTime = new Date();
  
  return this.save();
};

// Method to check in
bookingSchema.methods.checkIn = function() {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be checked in');
  }
  
  this.checkInTime = new Date();
  
  return this.save();
};

// Static method to find bookings by user
bookingSchema.statics.findByUser = function(userId, status) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('route schedule vehicle');
};

// Static method to find bookings by route and date
bookingSchema.statics.findByRouteAndDate = function(routeId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    route: routeId,
    travelDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['pending', 'confirmed'] }
  });
};

// Static method to find bookings by date range
bookingSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    travelDate: { $gte: startDate, $lte: endDate }
  }).populate('route schedule vehicle user');
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        travelDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalFare: { $sum: '$fare' }
      }
    }
  ]);
};

module.exports = mongoose.model('Booking', bookingSchema);