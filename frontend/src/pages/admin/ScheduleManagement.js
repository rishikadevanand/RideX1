import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Schedule,
  AccessTime,
  DirectionsBus
} from '@mui/icons-material';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      routeName: 'Route A - Downtown Loop',
      vehicleId: 'BUS-001',
      departureTime: '06:00',
      arrivalTime: '06:45',
      frequency: 'Every 15 min',
      status: 'active'
    },
    {
      id: 2,
      routeName: 'Route B - University Line',
      vehicleId: 'BUS-002',
      departureTime: '07:00',
      arrivalTime: '08:00',
      frequency: 'Every 20 min',
      status: 'active'
    },
    {
      id: 3,
      routeName: 'Route C - Airport Express',
      vehicleId: 'BUS-003',
      departureTime: '05:30',
      arrivalTime: '05:55',
      frequency: 'Every 30 min',
      status: 'maintenance'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    routeName: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    frequency: '',
    status: 'active'
  });

  const routes = ['Route A - Downtown Loop', 'Route B - University Line', 'Route C - Airport Express'];
  const vehicles = ['BUS-001', 'BUS-002', 'BUS-003', 'BUS-004', 'BUS-005'];

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData(schedule);
    } else {
      setEditingSchedule(null);
      setFormData({
        routeName: '',
        vehicleId: '',
        departureTime: '',
        arrivalTime: '',
        frequency: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSchedule(null);
  };

  const handleSave = () => {
    if (editingSchedule) {
      setSchedules(schedules.map(schedule => 
        schedule.id === editingSchedule.id ? { ...schedule, ...formData } : schedule
      ));
    } else {
      const newSchedule = {
        id: schedules.length + 1,
        ...formData
      };
      setSchedules([...schedules, newSchedule]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Schedule sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">
            Schedule Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Schedule
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Route</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.routeName}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <DirectionsBus sx={{ mr: 1, fontSize: 16 }} />
                        {schedule.vehicleId}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                        {schedule.departureTime}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                        {schedule.arrivalTime}
                      </Box>
                    </TableCell>
                    <TableCell>{schedule.frequency}</TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(schedule)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Route</InputLabel>
                <Select
                  value={formData.routeName}
                  onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                >
                  {routes.map((route) => (
                    <MenuItem key={route} value={route}>
                      {route}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vehicle</InputLabel>
                <Select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Departure Time"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Arrival Time"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <MenuItem value="Every 10 min">Every 10 min</MenuItem>
                  <MenuItem value="Every 15 min">Every 15 min</MenuItem>
                  <MenuItem value="Every 20 min">Every 20 min</MenuItem>
                  <MenuItem value="Every 30 min">Every 30 min</MenuItem>
                  <MenuItem value="Every hour">Every hour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingSchedule ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleManagement;
