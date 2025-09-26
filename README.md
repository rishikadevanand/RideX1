# Smart Ticket Tracker

A comprehensive full-stack transportation booking and tracking system with AI-powered forecasting capabilities.

## 🚀 Features

### Frontend
- **React + Material-UI**: Modern, responsive user interface
- **Multi-language Support**: English and Tamil with i18next
- **Real-time Updates**: Live booking and vehicle tracking via Socket.IO
- **Booking System**: Search routes, select seats, confirm bookings
- **Admin Dashboard**: Complete management interface
- **Forecast Integration**: AI-powered predictions and analytics

### Backend
- **Node.js + Express**: RESTful API with comprehensive endpoints
- **MongoDB + Mongoose**: Robust data persistence
- **JWT Authentication**: Secure access with refresh tokens
- **Socket.IO**: Real-time communication
- **Role-based Access**: User and admin roles
- **Security**: bcrypt, helmet, CORS, rate limiting

### Forecasting Service
- **AI Predictions**: ARIMA/Prophet-based forecasting
- **Route Analytics**: Utilization heatmaps and trends
- **Real-time Data**: Live capacity and utilization tracking
- **Recommendations**: AI-powered optimization suggestions

## 📁 Project Structure

```
smart-ticket-tracker/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & error handling
│   ├── datasets/          # Sample data
│   └── scripts/           # Database seeding
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/      # API services
│   │   └── i18n/          # Internationalization
├── forecasting/            # AI forecasting service
│   ├── services/          # Forecasting logic
│   ├── controllers/       # API controllers
│   └── datasets/          # Training data
├── nginx/                 # Reverse proxy config
├── docker-compose.dev.yml # Development setup
├── docker-compose.prod.yml # Production setup
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- React Query
- Socket.IO Client
- i18next (EN/Tamil)
- Jest + React Testing Library

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcrypt, helmet, CORS
- Winston logging

### Forecasting
- Node.js microservice
- ARIMA/Prophet algorithms
- CSV data processing
- Real-time predictions

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy
- GitHub Actions CI
- Multi-stage builds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-ticket-tracker
   ```

2. **Start all services**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Seed the database**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Forecasting: http://localhost:5001

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Root directory
   npm install

   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install

   # Forecasting
   cd ../forecasting
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp backend/env.template backend/.env
   cp forecasting/.env.template forecasting/.env
   cp frontend/.env.template frontend/.env
   ```

3. **Start MongoDB and Redis**
   ```bash
   # MongoDB
   mongod

   # Redis
   redis-server
   ```

4. **Start services**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Forecasting
   cd forecasting
   npm run dev

   # Terminal 3 - Frontend
   cd frontend
   npm start

   # Terminal 4 - Seed database
   cd backend
   npm run seed
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/smart_ticket_tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
FORECAST_SERVICE_URL=http://localhost:5001
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### Forecasting (.env)
```env
NODE_ENV=development
PORT=5001
```

## 📊 Database Seeding

The project includes comprehensive sample data:

- **10+ Routes**: Bus, Metro, Train services
- **25+ Schedules**: Daily trips with times
- **10+ Vehicles**: Different capacities and features
- **12+ Users**: Sample commuters and admin
- **50+ Bookings**: Historical booking data
- **Forecast Data**: Time-series training data

### Seed Commands
```bash
# Using Docker
docker-compose -f docker-compose.dev.yml exec backend npm run seed

# Local development
cd backend
npm run seed
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test

# All tests
npm test
```

### Test Coverage
- Backend: Jest + Supertest
- Frontend: Jest + React Testing Library
- API endpoints: Comprehensive test suite
- Components: Unit and integration tests

## 🚀 Production Deployment

### Using Docker Compose
```bash
# Set production environment variables
cp .env.production .env

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Start forecasting: `cd forecasting && npm start`
4. Configure Nginx reverse proxy

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/verify-email` - Email verification

### Core Endpoints
- `GET /api/routes` - Get all routes
- `GET /api/schedules` - Get schedules for route
- `GET /api/bookings` - User bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin Endpoints
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/status` - Update user status
- `GET /api/health` - System health check

### Forecasting Endpoints
- `GET /forecast/predict` - Get predictions
- `GET /forecast/routes/:id/analytics` - Route analytics

## 🔒 Security Features

- **JWT Authentication**: Access and refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API endpoint protection
- **CORS**: Cross-origin request handling
- **Helmet**: Security headers
- **Input Validation**: Request data sanitization
- **Role-based Access**: User/admin permissions

## 🌐 Internationalization

The application supports multiple languages:
- **English**: Default language
- **Tamil**: Full translation support

Language switching is available in the navigation bar.

## 📈 Monitoring & Analytics

### Health Checks
- Backend: `GET /api/health`
- Forecasting: `GET /forecast/health`
- Metrics: `GET /api/health/metrics`

### Real-time Features
- Live vehicle tracking
- Booking updates
- Capacity monitoring
- Forecast updates

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB is running
   mongosh --eval "db.adminCommand('ping')"
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis is running
   redis-cli ping
   ```

3. **Port Already in Use**
   ```bash
   # Kill process on port
   lsof -ti:5000 | xargs kill -9
   ```

4. **Docker Issues**
   ```bash
   # Clean up containers
   docker-compose down -v
   docker system prune -a
   ```

### Logs
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f forecasting

# Local logs
tail -f backend/logs/combined.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Advanced ML models
- [ ] Real-time notifications
- [ ] Multi-tenant support
- [ ] API versioning
- [ ] GraphQL support

---

**Smart Ticket Tracker** - Intelligent transportation for the modern world.
