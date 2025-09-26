# Smart Ticket Tracker - Production Deployment Guide

## Overview

This guide covers the production deployment of the Smart Ticket Tracker application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB RAM available
- Ports 3000 and 5000 available

## Quick Start

### 1. Deploy Production Environment

```bash
# Start production deployment
npm run prod

# Check logs
npm run prod:logs

# Stop production
npm run prod:stop

# Clean up (removes all containers, volumes, and images)
npm run prod:clean
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## Production Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Nginx)       │    │   (Node.js)     │
│   Port: 3000    │◄───┤   Port: 5000    │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the root directory with:

```env
# Database Configuration
MONGO_URI=mongodb://mongo:27017/smart_ticket_tracker

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your_super_secure_jwt_secret_key_for_production_12345
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_for_production_67890

# Server Configuration
NODE_ENV=production
PORT=5000

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

The frontend `.env` file is automatically configured:

```env
REACT_APP_API_URL=/api
```

## Production Features

### Security
- Non-root user execution
- Security headers (XSS, CSRF, etc.)
- Rate limiting
- JWT token authentication
- CORS configuration

### Performance
- Nginx reverse proxy
- Gzip compression
- Static asset caching
- Health checks
- Log rotation

### Monitoring
- Health check endpoints
- Structured logging
- Container health monitoring

## Docker Services

### Backend Service
- **Image**: Built from `backend/Dockerfile.prod`
- **Base**: Node.js 22 slim
- **Port**: 5000 (internal)
- **Health Check**: `/api/health`

### Frontend Service
- **Image**: Built from `frontend/Dockerfile.prod`
- **Base**: Nginx Alpine
- **Port**: 3000 (external)
- **Health Check**: `/health`

## Nginx Configuration

The frontend uses Nginx with:
- API proxy to backend (`/api` → `backend:5000`)
- React Router support (fallback to `index.html`)
- Static asset caching
- Gzip compression
- Security headers

## Production Scripts

```bash
# Start production environment
npm run prod

# Stop production environment
npm run prod:stop

# View logs
npm run prod:logs

# Clean up everything
npm run prod:clean
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   netstat -tulpn | grep :3000
   
   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Docker Build Fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild
   npm run prod:clean
   npm run prod
   ```

3. **Backend Connection Issues**
   ```bash
   # Check backend logs
   docker-compose -f docker-compose.prod.yml logs backend
   
   # Check backend health
   curl http://localhost:3000/api/health
   ```

### Health Checks

- **Frontend**: http://localhost:3000/health
- **Backend**: http://localhost:3000/api/health

## Scaling

To scale the application:

```bash
# Scale backend (if needed)
docker-compose -f docker-compose.prod.yml up --scale backend=2

# Scale frontend (if needed)
docker-compose -f docker-compose.prod.yml up --scale frontend=2
```

## Security Considerations

1. **Change Default Secrets**: Update JWT secrets in `.env`
2. **Use HTTPS**: Configure SSL certificates for production
3. **Database Security**: Use strong database passwords
4. **Network Security**: Configure firewall rules
5. **Regular Updates**: Keep Docker images updated

## Backup and Recovery

### Database Backup
```bash
# Backup MongoDB (if using external MongoDB)
mongodump --uri="mongodb://localhost:27017/smart_ticket_tracker" --out=./backup
```

### Application Backup
```bash
# Backup application data
docker-compose -f docker-compose.prod.yml exec backend tar -czf /tmp/backup.tar.gz /app/data
```

## Monitoring and Logs

### View Logs
```bash
# All services
npm run prod:logs

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Health Monitoring
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check health endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/health
```

## Performance Optimization

1. **Enable Gzip**: Already configured in Nginx
2. **Static Asset Caching**: Configured for 1 year
3. **Database Indexing**: Ensure proper database indexes
4. **Connection Pooling**: Configure database connection pooling
5. **CDN**: Consider using CDN for static assets

## Production Checklist

- [ ] Environment variables configured
- [ ] JWT secrets changed from defaults
- [ ] Database connection configured
- [ ] Health checks working
- [ ] SSL certificates configured (if using HTTPS)
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Log rotation configured

## Support

For issues and support:
1. Check logs: `npm run prod:logs`
2. Verify health: `curl http://localhost:3000/health`
3. Check Docker status: `docker-compose -f docker-compose.prod.yml ps`
4. Review this documentation
