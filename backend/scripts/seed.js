const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_ticket_tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Load datasets
    const routesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/routes.json'), 'utf8'));
    const schedulesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/schedules.json'), 'utf8'));
    const vehiclesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/vehicles.json'), 'utf8'));
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/users.json'), 'utf8'));
    const bookingsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../datasets/bookings.json'), 'utf8'));

    // Create users
    console.log('👥 Creating users...');
    const users = await User.insertMany(usersData);
    console.log(`✅ Created ${users.length} users`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@smarttickettracker.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        role: 'admin',
        isEmailVerified: true
      });
      await adminUser.save();
      users.push(adminUser);
      console.log('👑 Created admin user: admin@smarttickettracker.com / admin123');
    }

    // Create routes
    console.log('🛣️  Creating routes...');
    const routes = await Route.insertMany(routesData);
    console.log(`✅ Created ${routes.length} routes`);

    // Create vehicles
    console.log('🚌 Creating vehicles...');
    const vehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`✅ Created ${vehicles.length} vehicles`);

    // Create schedules with proper references
    console.log('📅 Creating schedules...');
    const schedules = [];
    for (const scheduleData of schedulesData) {
      const route = routes.find(r => r.name === scheduleData.routeName);
      const vehicle = vehicles.find(v => v.vehicleId === scheduleData.vehicleId);
      
      if (route && vehicle) {
        const schedule = new Schedule({
          route: route._id,
          vehicle: vehicle._id,
          departureTime: scheduleData.departureTime,
          arrivalTime: scheduleData.arrivalTime,
          daysOfWeek: scheduleData.daysOfWeek,
          frequency: scheduleData.frequency
        });
        schedules.push(await schedule.save());
      }
    }
    console.log(`✅ Created ${schedules.length} schedules`);

    // Create bookings with proper references
    console.log('🎫 Creating bookings...');
    const bookings = [];
    for (const bookingData of bookingsData) {
      const user = users.find(u => u.email === bookingData.userEmail);
      const route = routes.find(r => r.name === bookingData.routeName);
      const schedule = schedules.find(s => 
        s.route.toString() === route._id.toString() && 
        s.departureTime === bookingData.departureTime
      );
      const vehicle = vehicles.find(v => v.vehicleId === bookingData.vehicleId);
      
      if (user && route && schedule && vehicle) {
        const booking = new Booking({
          user: user._id,
          route: route._id,
          schedule: schedule._id,
          vehicle: vehicle._id,
          travelDate: new Date(bookingData.travelDate),
          seatNumber: bookingData.seatNumber,
          fare: bookingData.fare,
          status: bookingData.status,
          paymentStatus: bookingData.paymentStatus,
          bookingReference: bookingData.bookingReference,
          specialRequests: bookingData.specialRequests
        });
        bookings.push(await booking.save());
      }
    }
    console.log(`✅ Created ${bookings.length} bookings`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Routes: ${routes.length}`);
    console.log(`- Vehicles: ${vehicles.length}`);
    console.log(`- Schedules: ${schedules.length}`);
    console.log(`- Bookings: ${bookings.length}`);

    console.log('\n🔑 Admin Credentials:');
    console.log('Email: admin@smarttickettracker.com');
    console.log('Password: admin123');

    console.log('\n👤 Test User Credentials:');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(() => {
    seedData();
  });
}

module.exports = { connectDB, seedData };