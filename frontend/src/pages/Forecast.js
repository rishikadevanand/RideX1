import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Assessment } from '@mui/icons-material';
import { forecastAPI } from '../services/api';

const Forecast = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchForecastData();
  }, []);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const response = await forecastAPI.predict();
      setForecastData(response.data.data || []);
    } catch (err) {
      console.error('Forecast fetch error:', err);
      
      // Fallback to mock data if API fails
      const mockData = [
        { date: '2024-01-01', demand: 120, supply: 100, utilization: 83 },
        { date: '2024-01-02', demand: 135, supply: 110, utilization: 81 },
        { date: '2024-01-03', demand: 150, supply: 120, utilization: 80 },
        { date: '2024-01-04', demand: 140, supply: 115, utilization: 82 },
        { date: '2024-01-05', demand: 160, supply: 130, utilization: 81 },
        { date: '2024-01-06', demand: 180, supply: 140, utilization: 78 },
        { date: '2024-01-07', demand: 170, supply: 135, utilization: 79 },
        { date: '2024-01-08', demand: 190, supply: 150, utilization: 79 },
        { date: '2024-01-09', demand: 200, supply: 160, utilization: 80 },
        { date: '2024-01-10', demand: 220, supply: 170, utilization: 77 }
      ];
      
      setForecastData(mockData);
      setError('Using sample data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp color="success" />;
    if (current < previous) return <TrendingDown color="error" />;
    return <Assessment color="info" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'success';
    if (current < previous) return 'error';
    return 'info';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const latestData = forecastData[forecastData.length - 1];
  const previousData = forecastData[forecastData.length - 2];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Demand Forecast
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Current Demand
                  </Typography>
                  <Typography variant="h4">
                    {latestData?.demand || 0}
                  </Typography>
                </Box>
                {previousData && getTrendIcon(latestData?.demand, previousData.demand)}
              </Box>
              <Chip
                label={`${latestData?.demand > previousData?.demand ? '+' : ''}${latestData?.demand - previousData?.demand || 0}`}
                color={getTrendColor(latestData?.demand, previousData?.demand)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Available Supply
                  </Typography>
                  <Typography variant="h4">
                    {latestData?.supply || 0}
                  </Typography>
                </Box>
                {previousData && getTrendIcon(latestData?.supply, previousData.supply)}
              </Box>
              <Chip
                label={`${latestData?.supply > previousData?.supply ? '+' : ''}${latestData?.supply - previousData?.supply || 0}`}
                color={getTrendColor(latestData?.supply, previousData?.supply)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Utilization Rate
                  </Typography>
                  <Typography variant="h4">
                    {latestData?.utilization || 0}%
                  </Typography>
                </Box>
                {previousData && getTrendIcon(latestData?.utilization, previousData.utilization)}
              </Box>
              <Chip
                label={`${latestData?.utilization > previousData?.utilization ? '+' : ''}${(latestData?.utilization - previousData?.utilization || 0).toFixed(1)}%`}
                color={getTrendColor(latestData?.utilization, previousData?.utilization)}
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demand vs Supply Forecast
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="demand" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  name="Demand"
                />
                <Line 
                  type="monotone" 
                  dataKey="supply" 
                  stroke="#dc004e" 
                  strokeWidth={2}
                  name="Supply"
                />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#2e7d32" 
                  strokeWidth={2}
                  name="Utilization %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Forecast;
