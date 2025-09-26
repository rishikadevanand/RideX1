import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import toast from 'react-hot-toast';

let socket = null;

export const useSocket = () => {
  const { user } = useAuth();
  const { queryClient } = useBooking();

  useEffect(() => {
    if (user && !socket) {
      // Initialize socket connection
      socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      // Booking events
      socket.on('booking:create', (data) => {
        console.log('New booking created:', data);
        toast.success('New booking created!');
        // Invalidate bookings query to refresh data
        if (queryClient) {
          queryClient.invalidateQueries('bookings');
        }
      });

      socket.on('booking:cancel', (data) => {
        console.log('Booking cancelled:', data);
        toast.info('Booking cancelled');
        if (queryClient) {
          queryClient.invalidateQueries('bookings');
        }
      });

      socket.on('booking:update', (data) => {
        console.log('Booking updated:', data);
        if (queryClient) {
          queryClient.invalidateQueries('bookings');
        }
      });

      // Vehicle events
      socket.on('vehicle:location', (data) => {
        console.log('Vehicle location updated:', data);
        // Update vehicle location in cache if needed
        if (queryClient) {
          queryClient.invalidateQueries('vehicles');
        }
      });

      socket.on('vehicle:status', (data) => {
        console.log('Vehicle status updated:', data);
        toast.info(`Vehicle ${data.vehicleId} status: ${data.status}`);
        if (queryClient) {
          queryClient.invalidateQueries('vehicles');
        }
      });

      // Route events
      socket.on('route:update', (data) => {
        console.log('Route updated:', data);
        if (queryClient) {
          queryClient.invalidateQueries('routes');
        }
      });

      // Schedule events
      socket.on('schedule:update', (data) => {
        console.log('Schedule updated:', data);
        if (queryClient) {
          queryClient.invalidateQueries('schedules');
        }
      });

      // System notifications
      socket.on('system:notification', (data) => {
        console.log('System notification:', data);
        toast(data.message, {
          icon: data.type === 'error' ? '❌' : data.type === 'warning' ? '⚠️' : 'ℹ️',
        });
      });

      // Forecast updates
      socket.on('forecast:update', (data) => {
        console.log('Forecast updated:', data);
        if (queryClient) {
          queryClient.invalidateQueries('forecast');
        }
      });
    }

    return () => {
      if (socket && !user) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, queryClient]);

  return socket;
};

// Socket utility functions
export const socketUtils = {
  joinRoute: (routeId) => {
    if (socket) {
      socket.emit('join_route', routeId);
    }
  },

  leaveRoute: (routeId) => {
    if (socket) {
      socket.emit('leave_route', routeId);
    }
  },

  trackVehicle: (vehicleId) => {
    if (socket) {
      socket.emit('track_vehicle', vehicleId);
    }
  },

  stopTrackingVehicle: (vehicleId) => {
    if (socket) {
      socket.emit('stop_tracking_vehicle', vehicleId);
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  isConnected: () => {
    return socket ? socket.connected : false;
  },
};
