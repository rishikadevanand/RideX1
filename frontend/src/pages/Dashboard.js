import React from 'react';
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
  Avatar
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

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Book tickets and track your journeys with ease
        </Typography>
      </Box>

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

        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {user?.firstName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {user?.firstName} {user?.lastName}
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
                  All systems operational
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