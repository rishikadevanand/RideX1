# Smart Ticket Tracker - Backend

A comprehensive Node.js backend API for the Smart Ticket Tracker application, built with Express, MongoDB, and Socket.IO.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with access/refresh tokens
- **Role-based Access Control**: Admin, User, and Driver roles
- **Real-time Updates**: Socket.IO for live booking and vehicle tracking
- **Comprehensive API**: RESTful endpoints for all operations
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston-based structured logging
- **Testing**: Jest + Supertest for comprehensive test coverage
- **Database Seeding**: Automated data population with sample datasets

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-ticket-tracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/smart_ticket_tracker` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | Required |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `FORECAST_SERVICE_URL` | Forecasting service URL | `http://localhost:5001` |

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Verify email (stub)
- `POST /api/auth/forgot-password` - Request password reset (stub)

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Deactivate user (admin)

### Routes

- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes` - Create route (admin)
- `PUT /api/routes/:id` - Update route (admin)
- `DELETE /api/routes/:id` - Delete route (admin)

### Schedules

- `GET /api/schedules` - Get schedules for route
- `GET /api/schedules/:id` - Get schedule by ID
- `POST /api/schedules` - Create schedule (admin)
- `PUT /api/schedules/:id` - Update schedule (admin)
- `DELETE /api/schedules/:id` - Delete schedule (admin)

### Vehicles

- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create vehicle (admin)
- `PUT /api/vehicles/:id` - Update vehicle (admin)
- `PUT /api/vehicles/:id/location` - Update vehicle location
- `PUT /api/vehicles/:id/maintenance` - Update maintenance status

### Bookings

- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/check-in` - Check in for booking

### Forecast

- `GET /api/forecast/predict` - Get forecast predictions
- `GET /api/forecast/routes/:routeId/analytics` - Get route analytics
- `GET /api/forecast/trends` - Get forecasting trends

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check (admin)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Database Seeding

The application includes comprehensive seed data:

- **Users**: 5 test users + 1 admin user
- **Routes**: 5 transportation routes
- **Vehicles**: 6 vehicles (buses and metros)
- **Schedules**: 6 schedules linking routes and vehicles
- **Bookings**: 5 sample bookings

### Seed Commands

```bash
# Seed the database
npm run seed

# Clear and reseed
npm run seed:reset
```

### Default Admin Credentials

- **Email**: admin@smarttickettracker.com
- **Password**: admin123

### Test User Credentials

- **Email**: john.doe@example.com
- **Password**: password123

## 🔒 Security Features

- **JWT Authentication**: Access and refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable request limits
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers
- **Input Validation**: Express-validator middleware
- **SQL Injection Protection**: Mongoose ODM

## 📡 Real-time Features

Socket.IO events for real-time updates:

- `booking:create` - New booking created
- `booking:cancel` - Booking cancelled
- `vehicle:location` - Vehicle location updated
- `join_route` - Join route-specific room
- `track_vehicle` - Track specific vehicle

## 📝 Logging

Structured logging with Winston:

- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Development mode
- **Request logging**: HTTP request/response logging

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t smart-ticket-backend .

# Run container
docker run -p 5000:5000 --env-file .env smart-ticket-backend
```

### Environment-specific Configuration

- **Development**: Full logging, CORS enabled
- **Production**: Optimized logging, security headers
- **Testing**: In-memory database, isolated tests

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Database Management

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/smart_ticket_tracker

# Backup database
mongodump --db smart_ticket_tracker

# Restore database
mongorestore --db smart_ticket_tracker
```

## 📈 Monitoring

- **Health Checks**: `/api/health` endpoint
- **Metrics**: Memory usage, CPU usage, database stats
- **Logs**: Structured logging for monitoring
- **Error Tracking**: Comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the test cases for usage examples

## 🔄 API Versioning

Current API version: v1

All endpoints are prefixed with `/api/`

## 📋 TODO

- [ ] Implement Redis caching
- [ ] Add email service integration
- [ ] Implement file upload functionality
- [ ] Add API rate limiting per user
- [ ] Implement audit logging
- [ ] Add database migration scripts
