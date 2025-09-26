import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const queryClient = useQueryClient();

  // Get user bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery(
    'bookings',
    () => bookingsAPI.getAll(),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Create booking mutation
  const createBookingMutation = useMutation(
    (bookingData) => bookingsAPI.create(bookingData),
    {
      onSuccess: (response) => {
        toast.success('Booking created successfully!');
        queryClient.invalidateQueries('bookings');
        resetBookingState();
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Booking failed';
        toast.error(message);
      },
    }
  );

  // Cancel booking mutation
  const cancelBookingMutation = useMutation(
    ({ bookingId, reason }) => bookingsAPI.cancel(bookingId, reason),
    {
      onSuccess: () => {
        toast.success('Booking cancelled successfully!');
        queryClient.invalidateQueries('bookings');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Cancellation failed';
        toast.error(message);
      },
    }
  );

  // Confirm booking mutation
  const confirmBookingMutation = useMutation(
    (bookingId) => bookingsAPI.confirm(bookingId),
    {
      onSuccess: () => {
        toast.success('Booking confirmed successfully!');
        queryClient.invalidateQueries('bookings');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Confirmation failed';
        toast.error(message);
      },
    }
  );

  // Check-in mutation
  const checkInMutation = useMutation(
    (bookingId) => bookingsAPI.checkIn(bookingId),
    {
      onSuccess: () => {
        toast.success('Check-in successful!');
        queryClient.invalidateQueries('bookings');
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Check-in failed';
        toast.error(message);
      },
    }
  );

  const resetBookingState = () => {
    setSelectedRoute(null);
    setSelectedSchedule(null);
    setSelectedSeat(null);
    setBookingStep(1);
  };

  const nextStep = () => {
    setBookingStep(prev => prev + 1);
  };

  const prevStep = () => {
    setBookingStep(prev => prev - 1);
  };

  const goToStep = (step) => {
    setBookingStep(step);
  };

  const createBooking = async (bookingData) => {
    return createBookingMutation.mutateAsync(bookingData);
  };

  const cancelBooking = async (bookingId, reason) => {
    return cancelBookingMutation.mutateAsync({ bookingId, reason });
  };

  const confirmBooking = async (bookingId) => {
    return confirmBookingMutation.mutateAsync(bookingId);
  };

  const checkIn = async (bookingId) => {
    return checkInMutation.mutateAsync(bookingId);
  };

  const getBookingStats = () => {
    if (!bookings?.data?.bookings) return null;

    const stats = {
      total: bookings.data.bookings.length,
      confirmed: bookings.data.bookings.filter(b => b.status === 'confirmed').length,
      cancelled: bookings.data.bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.data.bookings.filter(b => b.status === 'completed').length,
      pending: bookings.data.bookings.filter(b => b.status === 'pending').length,
      totalFare: bookings.data.bookings.reduce((sum, b) => sum + b.fare, 0)
    };

    return stats;
  };

  const value = {
    // State
    selectedRoute,
    setSelectedRoute,
    selectedSchedule,
    setSelectedSchedule,
    selectedSeat,
    setSelectedSeat,
    bookingStep,
    setBookingStep,
    
    // Data
    bookings: bookings?.data?.bookings || [],
    bookingsLoading,
    bookingStats: getBookingStats(),
    
    // Actions
    nextStep,
    prevStep,
    goToStep,
    resetBookingState,
    createBooking,
    cancelBooking,
    confirmBooking,
    checkIn,
    
    // Loading states
    isCreating: createBookingMutation.isLoading,
    isCancelling: cancelBookingMutation.isLoading,
    isConfirming: confirmBookingMutation.isLoading,
    isCheckingIn: checkInMutation.isLoading,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
