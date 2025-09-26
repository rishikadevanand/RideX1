const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  departureTime: {
    type: String,
    required: [true, 'Departure time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  arrivalTime: {
    type: String,
    required: [true, 'Arrival time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  daysOfWeek: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: [true, 'At least one day of week is required']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekdays', 'weekends', 'custom'],
    default: 'daily'
  },
  specialDates: [{
    date: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    reason: {
      type: String,
      trim: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
scheduleSchema.index({ route: 1, daysOfWeek: 1, isActive: 1 });
scheduleSchema.index({ departureTime: 1 });
scheduleSchema.index({ vehicle: 1 });
scheduleSchema.index({ 'specialDates.date': 1 });

// Virtual for schedule duration
scheduleSchema.virtual('duration').get(function() {
  const depTime = this.departureTime.split(':');
  const arrTime = this.arrivalTime.split(':');
  const depMinutes = parseInt(depTime[0]) * 60 + parseInt(depTime[1]);
  const arrMinutes = parseInt(arrTime[0]) * 60 + parseInt(arrTime[1]);
  return arrMinutes - depMinutes;
});

// Method to check if schedule runs on specific date
scheduleSchema.methods.runsOnDate = function(date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  // Check if it's a special date
  const specialDate = this.specialDates.find(sd => 
    sd.date.toDateString() === date.toDateString()
  );
  
  if (specialDate) {
    return specialDate.isActive;
  }
  
  // Check regular days
  return this.daysOfWeek.includes(dayOfWeek);
};

// Method to get next departure time
scheduleSchema.methods.getNextDeparture = function() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
  
  if (this.departureTime > currentTime) {
    return this.departureTime;
  }
  
  return null; // Schedule has passed for today
};

// Static method to find schedules by route and date
scheduleSchema.statics.findByRouteAndDate = function(routeId, date) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
  
  return this.find({
    route: routeId,
    $or: [
      { daysOfWeek: dayOfWeek },
      { 'specialDates.date': { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } }
    ],
    isActive: true
  }).populate('vehicle');
};

// Static method to find schedules by time range
scheduleSchema.statics.findByTimeRange = function(startTime, endTime) {
  return this.find({
    departureTime: { $gte: startTime, $lte: endTime },
    isActive: true
  }).populate('route vehicle');
};

module.exports = mongoose.model('Schedule', scheduleSchema);