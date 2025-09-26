import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { useSocket } from './hooks/useSocket';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import Forecast from './pages/Forecast';
import AdminDashboard from './pages/AdminDashboard';
import RouteManagement from './pages/admin/RouteManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';

function App() {
  const { user, loading } = useAuth();
  useSocket(); // Initialize socket connection

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Box>Loading Smart Ticket Tracker...</Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: user.role === 'admin' ? 30 : 0 },
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: 'background.default',
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Routes */}
          {user.role === 'admin' && (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/routes" element={<RouteManagement />} />
              <Route path="/admin/schedules" element={<ScheduleManagement />} />
              <Route path="/admin/vehicles" element={<VehicleManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </>
          )}
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;