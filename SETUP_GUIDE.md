# Smart Ticket Tracker - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas cloud)
- Git

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: MongoDB Setup

#### Option A: MongoDB Atlas (Cloud - Easiest)
1. Go to https://www.mongodb.com/atlas
2. Create free account and cluster
3. Get connection string
4. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartticket
   ```

#### Option B: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install with Complete Setup
3. Start MongoDB service
4. Verify with: `mongosh`

### Step 3: Run the Application

#### Development Mode (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### Production Mode (Docker)
```bash
# Install Docker Desktop first
npm run prod
```

### Step 4: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔧 Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not running, start MongoDB service
# Windows: Start-Service MongoDB
# Or use MongoDB Atlas (cloud)
```

#### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F
```

### Frontend Issues

#### Port 3000 in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F
```

#### Build Errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Dependencies Issues

#### Missing Packages
```bash
# Install missing dependencies
npm install concurrently
cd backend && npm install
cd ../frontend && npm install
```

## 📋 Testing the Application

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
# Should return: {"success":true,"message":"Backend is running!"}
```

### 2. Frontend Access
- Open http://localhost:3000
- Should see the Smart Ticket Tracker login page

### 3. Full Flow Test
1. **Register** a new user
2. **Login** with credentials
3. **Access Dashboard** - should show user info and stats
4. **Create Booking** - test the booking flow
5. **Admin Features** - if user role is admin

## 🐳 Production Deployment

### Using Docker

1. **Install Docker Desktop**
   - Download from https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Run Production**
   ```bash
   npm run prod
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

### Production Commands
```bash
# Start production
npm run prod

# Stop production
npm run prod:stop

# View logs
npm run prod:logs

# Clean up
npm run prod:clean
```

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartticket
JWT_SECRET=your_jwt_secret_key_here_12345
JWT_REFRESH_SECRET=your_refresh_secret_key_here_67890
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 Application Features

### ✅ Working Features
- User Authentication (Register/Login/Logout)
- Protected Routes (Login required)
- Admin Dashboard (Role-based access)
- Booking System (Create/View/Cancel)
- Real-time Dashboard with stats
- Forecast Analytics with charts
- User Profile Management
- Production Docker deployment

### 🔧 API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/routes` - Get routes
- `GET /api/forecast` - Get forecast data
- `GET /api/health` - Health check

## 🆘 Getting Help

### Common Issues
1. **MongoDB not running** → Install MongoDB or use Atlas
2. **Port conflicts** → Kill processes using ports 3000/5000
3. **Dependencies missing** → Run `npm install` in all directories
4. **Build errors** → Clear cache and reinstall

### Support
- Check logs: `npm run prod:logs`
- Health check: http://localhost:5000/api/health
- MongoDB status: `mongosh` or Atlas dashboard

## 🎯 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Run the application** using the commands above
3. **Test the full flow** (register → login → dashboard → booking)
4. **Deploy to production** using Docker

The Smart Ticket Tracker is now ready to use! 🎉
