import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  People,
  DirectionsBus,
  Route,
  Assessment
} from '@mui/icons-material';

const Analytics = () => {
  // Mock data for charts
  const routeData = [
    { name: 'Route A', passengers: 240, revenue: 1200 },
    { name: 'Route B', passengers: 180, revenue: 900 },
    { name: 'Route C', passengers: 320, revenue: 1600 },
    { name: 'Route D', passengers: 150, revenue: 750 },
    { name: 'Route E', passengers: 280, revenue: 1400 }
  ];

  const vehicleUtilization = [
    { name: 'BUS-001', utilization: 85 },
    { name: 'BUS-002', utilization: 92 },
    { name: 'BUS-003', utilization: 78 },
    { name: 'BUS-004', utilization: 88 },
    { name: 'BUS-005', utilization: 95 }
  ];

  const timeSeriesData = [
    { time: '00:00', passengers: 45 },
    { time: '04:00', passengers: 20 },
    { time: '08:00', passengers: 180 },
    { time: '12:00', passengers: 220 },
    { time: '16:00', passengers: 195 },
    { time: '20:00', passengers: 120 },
    { time: '24:00', passengers: 60 }
  ];

  const statusData = [
    { name: 'Active', value: 12, color: '#2e7d32' },
    { name: 'Maintenance', value: 3, color: '#ed6c02' },
    { name: 'Inactive', value: 2, color: '#d32f2f' }
  ];

  const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#9c27b0'];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={4}>
        <Assessment sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4">
          Analytics Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Passengers
                  </Typography>
                  <Typography variant="h4">1,250</Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    +12% from last month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DirectionsBus sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Vehicles
                  </Typography>
                  <Typography variant="h4">12</Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    85% utilization
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Route sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Routes
                  </Typography>
                  <Typography variant="h4">8</Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    +2 new routes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Revenue
                  </Typography>
                  <Typography variant="h4">$5,850</Typography>
                  <Typography variant="body2" color="success.main">
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    +8% from last month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Route Performance */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Route Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="passengers" fill="#1976d2" name="Passengers" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#dc004e" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vehicle Status
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Passenger Flow */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Passenger Flow by Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="passengers" stroke="#2e7d32" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle Utilization */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vehicle Utilization
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vehicleUtilization} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
