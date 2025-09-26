import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BookOnline,
  History,
  TrendingUp,
  DirectionsBus,
  Route,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { routesAPI, vehiclesAPI, healthAPI } from '../services/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookings, bookingStats } = useBooking();
  const navigate = useNavigate();
  
  const [systemStats, setSystemStats] = useState({
    routes: 0,
    vehicles: 0,
    activeVehicles: 0,
    systemHealth: 'operational'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const [routesResponse, vehiclesResponse, healthResponse] = await Promise.allSettled([
        routesAPI.getAll(),
        vehiclesAPI.getAll(),
        healthAPI.check()
      ]);

      const routes = routesResponse.status === 'fulfilled' ? routesResponse.value.data.data : [];
      const vehicles = vehiclesResponse.status === 'fulfilled' ? vehiclesResponse.value.data.data : [];
      const health = healthResponse.status === 'fulfilled' ? healthResponse.value.data : {};

      setSystemStats({
        routes: routes.length || 0,
        vehicles: vehicles.length || 0,
        activeVehicles: vehicles.filter(v => v.status === 'active').length || 0,
        systemHealth: health.status || 'operational'
      });
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
      setError('Failed to load system information');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: t('navigation.booking'),
      description: 'Book a new ticket',
      icon: <BookOnline />,
      color: 'primary',
      path: '/booking'
    },
    {
      title: t('navigation.bookingHistory'),
      description: 'View your bookings',
      icon: <History />,
      color: 'secondary',
      path: '/booking-history'
    },
    {
      title: t('navigation.forecast'),
      description: 'Check forecast and analytics',
      icon: <TrendingUp />,
      color: 'success',
      path: '/forecast'
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.name || user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Book tickets and track your journeys with ease
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.path}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="h6" component="h2">
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color={action.color}
                  onClick={() => navigate(action.path)}
                >
                  Go to {action.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Booking Stats */}
        {bookingStats && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Bookings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {bookingStats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Bookings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {bookingStats.confirmed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Confirmed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {bookingStats.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        ${bookingStats.totalFare || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate('/booking-history')}
                >
                  View All Bookings
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {(user?.name || user?.firstName)?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {user?.name || `${user?.firstName} ${user?.lastName}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={user?.role === 'admin' ? 'Administrator' : 'User'}
                  color={user?.role === 'admin' ? 'primary' : 'default'}
                  size="small"
                />
                <Chip
                  label={user?.preferences?.language === 'ta' ? 'தமிழ்' : 'English'}
                  color="secondary"
                  size="small"
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/profile')}
              >
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {systemStats.routes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Routes
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {systemStats.activeVehicles}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Vehicles
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: systemStats.systemHealth === 'operational' ? 'success.main' : 'error.main',
                    mr: 1
                  }}
                />
                <Typography variant="body2">
                  System: {systemStats.systemHealth}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    mr: 1
                  }}
                />
                <Typography variant="body2">
                  Real-time tracking active
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    mr: 1
                  }}
                />
                <Typography variant="body2">
                  Forecasting service online
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;