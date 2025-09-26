import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import {
  Route,
  Schedule,
  DirectionsBus,
  People,
  Analytics,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Route Management',
      description: 'Manage bus routes, stops, and route configurations',
      icon: <Route sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/admin/routes'
    },
    {
      title: 'Schedule Management',
      description: 'Create and manage bus schedules and timetables',
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#dc004e',
      path: '/admin/schedules'
    },
    {
      title: 'Vehicle Management',
      description: 'Manage fleet vehicles, maintenance, and capacity',
      icon: <DirectionsBus sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/admin/vehicles'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/admin/users'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and performance metrics',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/admin/analytics'
    }
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={4}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <DashboardIcon />
        </Avatar>
        <Typography variant="h4">
          Admin Dashboard
        </Typography>
      </Box>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Manage your transportation system
      </Typography>

      <Grid container spacing={3}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  mb={2}
                  sx={{ color: card.color }}
                >
                  {card.icon}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {card.title}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ flexGrow: 1, mb: 2 }}
                >
                  {card.description}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(card.path)}
                  sx={{
                    bgcolor: card.color,
                    '&:hover': {
                      bgcolor: card.color,
                      opacity: 0.9
                    }
                  }}
                >
                  Manage
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary">
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Routes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                45
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Vehicles
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                1,234
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registered Users
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                89%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System Uptime
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
