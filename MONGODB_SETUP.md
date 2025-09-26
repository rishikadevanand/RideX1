# MongoDB Setup for Smart Ticket Tracker

## Option A: Local MongoDB Installation (Recommended for Development)

### 1. Download and Install MongoDB Community Edition

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0+)
   - OS: Windows
   - Package: MSI
3. Download and run the installer
4. Choose **Complete Setup** during installation
5. Enable **MongoDB Compass** (GUI tool)
6. Install MongoDB as a Windows Service

### 2. Verify Installation

Open PowerShell as Administrator and run:
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service if not running
Start-Service MongoDB

# Test connection
mongosh
```

### 3. Update Backend Environment

The backend/.env file is already configured with:
```
MONGO_URI=mongodb://localhost:27017/smartticket
```

## Option B: MongoDB Atlas (Cloud - Easier Setup)

### 1. Create Free MongoDB Atlas Account

1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Create a new cluster (choose the free M0 tier)
4. Choose a region close to you
5. Create a database user with username/password
6. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartticket?retryWrites=true&w=majority
   ```

### 3. Update Backend Environment

Update `backend/.env` with your Atlas connection string:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartticket?retryWrites=true&w=majority
```

## Option C: Docker MongoDB (If Docker is Available)

If you have Docker installed, you can run MongoDB in a container:

```bash
# Run MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=smartticket mongo:latest

# Verify it's running
docker ps
```

## Testing the Connection

Once MongoDB is set up, test the backend connection:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: localhost (or your Atlas cluster)
Server running on port 5000
```

## Troubleshooting

### MongoDB Service Not Starting
```powershell
# Check service status
Get-Service MongoDB

# Start service manually
Start-Service MongoDB

# Check logs
Get-EventLog -LogName Application -Source MongoDB
```

### Connection Refused
- Ensure MongoDB service is running
- Check if port 27017 is not blocked by firewall
- Verify the connection string in backend/.env

### Atlas Connection Issues
- Ensure your IP is whitelisted
- Check username/password are correct
- Verify the connection string format
