import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { routesAPI, schedulesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Booking = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: null,
    transportType: ''
  });
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState('');

  const { data: routes, isLoading: routesLoading } = useQuery(
    ['routes', searchParams],
    () => routesAPI.getAll(searchParams),
    {
      enabled: searchParams.from && searchParams.to,
      onSuccess: (data) => {
        if (data?.data?.routes?.length === 0) {
          toast.error('No routes found for your search');
        }
      }
    }
  );

  const { data: schedules, isLoading: schedulesLoading } = useQuery(
    ['schedules', selectedRoute?.id],
    () => schedulesAPI.getByRoute(selectedRoute?.id),
    {
      enabled: !!selectedRoute,
    }
  );

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.to || !searchParams.date) {
      toast.error('Please fill in all search fields');
      return;
    }
    // Search is triggered by the useQuery hook
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setSelectedSchedule(null);
    setSelectedSeat('');
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeat('');
  };

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeat(seatNumber);
  };

  const handleBooking = () => {
    if (!selectedRoute || !selectedSchedule || !selectedSeat) {
      toast.error('Please complete all selections');
      return;
    }

    // Here you would implement the actual booking logic
    toast.success('Booking created successfully!');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('booking.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Routes
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label={t('booking.from')}
                    value={searchParams.from}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label={t('booking.to')}
                    value={searchParams.to}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label={t('booking.date')}
                    value={searchParams.date}
                    onChange={(date) => setSearchParams(prev => ({ ...prev, date }))}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Transport Type</InputLabel>
                    <Select
                      value={searchParams.transportType}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, transportType: e.target.value }))}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="bus">Bus</MenuItem>
                      <MenuItem value="metro">Metro</MenuItem>
                      <MenuItem value="train">Train</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={routesLoading}
                    fullWidth
                  >
                    {routesLoading ? 'Searching...' : t('booking.searchRoutes')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Routes Results */}
        {routes?.data?.routes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Available Routes
                </Typography>
                <Grid container spacing={2}>
                  {routes.data.routes.map((route) => (
                    <Grid item xs={12} md={6} key={route._id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedRoute?._id === route._id ? '2px solid' : '1px solid',
                          borderColor: selectedRoute?._id === route._id ? 'primary.main' : 'grey.300'
                        }}
                        onClick={() => handleRouteSelect(route)}
                      >
                        <CardContent>
                          <Typography variant="h6">{route.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {route.startLocation.name} → {route.endLocation.name}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={route.transportType} size="small" />
                            <Chip label={`${route.distance}km`} size="small" />
                            <Chip label={`₹${route.baseFare}`} size="small" color="primary" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Schedules */}
        {selectedRoute && schedules?.data && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Schedule
                </Typography>
                <Grid container spacing={2}>
                  {schedules.data.map((schedule) => (
                    <Grid item xs={12} sm={6} md={4} key={schedule._id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedSchedule?._id === schedule._id ? '2px solid' : '1px solid',
                          borderColor: selectedSchedule?._id === schedule._id ? 'primary.main' : 'grey.300'
                        }}
                        onClick={() => handleScheduleSelect(schedule)}
                      >
                        <CardContent>
                          <Typography variant="h6">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Vehicle: {schedule.vehicle?.vehicleId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Capacity: {schedule.vehicle?.capacity}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Seat Selection */}
        {selectedSchedule && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Seat
                </Typography>
                <Grid container spacing={1}>
                  {Array.from({ length: selectedSchedule.vehicle?.capacity || 50 }, (_, i) => i + 1).map((seatNumber) => (
                    <Grid item xs={2} sm={1} key={seatNumber}>
                      <Button
                        variant={selectedSeat === `Seat ${seatNumber}` ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleSeatSelect(`Seat ${seatNumber}`)}
                        sx={{ minWidth: 'auto', width: '100%' }}
                      >
                        {seatNumber}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Booking Summary */}
        {selectedRoute && selectedSchedule && selectedSeat && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography><strong>Route:</strong> {selectedRoute.name}</Typography>
                  <Typography><strong>Schedule:</strong> {selectedSchedule.departureTime} - {selectedSchedule.arrivalTime}</Typography>
                  <Typography><strong>Seat:</strong> {selectedSeat}</Typography>
                  <Typography><strong>Fare:</strong> ₹{selectedRoute.baseFare}</Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBooking}
                  fullWidth
                >
                  {t('booking.confirmBooking')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Booking;
