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
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Route,
  LocationOn,
  Schedule
} from '@mui/icons-material';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([
    {
      id: 1,
      name: 'Route A - Downtown Loop',
      startPoint: 'Central Station',
      endPoint: 'City Center',
      stops: 8,
      duration: '45 min',
      status: 'active'
    },
    {
      id: 2,
      name: 'Route B - University Line',
      startPoint: 'University Campus',
      endPoint: 'Downtown',
      stops: 12,
      duration: '60 min',
      status: 'active'
    },
    {
      id: 3,
      name: 'Route C - Airport Express',
      startPoint: 'Airport',
      endPoint: 'City Center',
      stops: 3,
      duration: '25 min',
      status: 'maintenance'
    }
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startPoint: '',
    endPoint: '',
    stops: '',
    duration: '',
    status: 'active'
  });

  const handleOpenDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData(route);
    } else {
      setEditingRoute(null);
      setFormData({
        name: '',
        startPoint: '',
        endPoint: '',
        stops: '',
        duration: '',
        status: 'active'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoute(null);
  };

  const handleSave = () => {
    if (editingRoute) {
      setRoutes(routes.map(route => 
        route.id === editingRoute.id ? { ...route, ...formData } : route
      ));
    } else {
      const newRoute = {
        id: routes.length + 1,
        ...formData
      };
      setRoutes([...routes, newRoute]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setRoutes(routes.filter(route => route.id !== id));
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
          <Route sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">
            Route Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Route
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Route Name</TableCell>
                  <TableCell>Start Point</TableCell>
                  <TableCell>End Point</TableCell>
                  <TableCell>Stops</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        {route.name}
                      </Box>
                    </TableCell>
                    <TableCell>{route.startPoint}</TableCell>
                    <TableCell>{route.endPoint}</TableCell>
                    <TableCell>{route.stops}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Schedule sx={{ mr: 1, fontSize: 16 }} />
                        {route.duration}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={route.status}
                        color={getStatusColor(route.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(route)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(route.id)}
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
          {editingRoute ? 'Edit Route' : 'Add New Route'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Route Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Point"
                value={formData.startPoint}
                onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Point"
                value={formData.endPoint}
                onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Number of Stops"
                type="number"
                value={formData.stops}
                onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingRoute ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteManagement;
