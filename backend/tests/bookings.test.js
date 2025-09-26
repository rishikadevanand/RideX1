const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server').app;
const User = require('../models/User');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

describe('Booking Routes', () => {
  let authToken;
  let userId;
  let routeId;
  let scheduleId;
  let vehicleId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart_ticket_tracker_test');
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all data
    await User.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});

    // Create test user and get auth token
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.accessToken;
    userId = registerResponse.body.data.user._id;

    // Create test route
    const route = new Route({
      name: 'Test Route',
      transportType: 'bus',
      startLocation: {
        name: 'Start',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      endLocation: {
        name: 'End',
        coordinates: { lat: 12.8456, lng: 77.6603 }
      },
      distance: 10,
      estimatedDuration: 30,
      baseFare: 20
    });
    await route.save();
    routeId = route._id;

    // Create test vehicle
    const vehicle = new Vehicle({
      vehicleId: 'TEST001',
      type: 'bus',
      capacity: 50,
      maintenance: {
        nextService: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    await vehicle.save();
    vehicleId = vehicle._id;

    // Create test schedule
    const schedule = new Schedule({
      route: routeId,
      vehicle: vehicleId,
      departureTime: '08:00',
      arrivalTime: '08:30',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    });
    await schedule.save();
    scheduleId = schedule._id;
  });

  describe('GET /api/bookings', () => {
    it('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toBeDefined();
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      const bookingData = {
        routeId: routeId.toString(),
        scheduleId: scheduleId.toString(),
        travelDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        seatNumber: 'A1',
        fare: 20
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.seatNumber).toBe('A1');
      expect(response.body.data.bookingReference).toBeDefined();
    });

    it('should fail with invalid route ID', async () => {
      const bookingData = {
        routeId: 'invalid-id',
        scheduleId: scheduleId.toString(),
        travelDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        seatNumber: 'A1',
        fare: 20
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const bookingData = {
        routeId: routeId.toString(),
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if seat is already booked', async () => {
      const bookingData = {
        routeId: routeId.toString(),
        scheduleId: scheduleId.toString(),
        travelDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        seatNumber: 'A1',
        fare: 20
      };

      // Create first booking
      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      // Create second user and try to book same seat
      const secondUserData = {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Test2',
        lastName: 'User',
        phone: '+1234567891'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(secondUserData);

      const secondAuthToken = registerResponse.body.data.accessToken;

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .send(bookingData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Seat already booked');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let bookingId;

    beforeEach(async () => {
      // Create a booking first
      const bookingData = {
        routeId: routeId.toString(),
        scheduleId: scheduleId.toString(),
        travelDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        seatNumber: 'A1',
        fare: 20
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData);

      bookingId = response.body.data._id;
    });

    it('should cancel a booking', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should fail to cancel non-existent booking', async () => {
      const response = await request(app)
        .put('/api/bookings/invalid-id/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Change of plans' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail to cancel another user\'s booking', async () => {
      // Create second user
      const secondUserData = {
        email: 'test2@example.com',
        password: 'password123',
        firstName: 'Test2',
        lastName: 'User',
        phone: '+1234567891'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(secondUserData);

      const secondAuthToken = registerResponse.body.data.accessToken;

      const response = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .send({ reason: 'Change of plans' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
