import React from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookingHistory = () => {
  const { t } = useTranslation();

  const { data: bookings, isLoading, refetch } = useQuery(
    'bookings',
    () => bookingsAPI.getAll()
  );

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingsAPI.cancel(bookingId, 'User requested cancellation');
      toast.success(t('bookingHistory.cancelSuccess'));
      refetch();
    } catch (error) {
      toast.error(t('bookingHistory.cancelFailed'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('bookingHistory.title')}
      </Typography>

      {bookings?.data?.bookings?.length === 0 ? (
        <Alert severity="info">
          {t('bookingHistory.noBookings')}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('bookingHistory.bookingReference')}</TableCell>
                <TableCell>{t('bookingHistory.route')}</TableCell>
                <TableCell>{t('bookingHistory.date')}</TableCell>
                <TableCell>{t('bookingHistory.time')}</TableCell>
                <TableCell>{t('bookingHistory.seat')}</TableCell>
                <TableCell>{t('bookingHistory.status')}</TableCell>
                <TableCell>{t('bookingHistory.fare')}</TableCell>
                <TableCell>{t('bookingHistory.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings?.data?.bookings?.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>{booking.bookingReference}</TableCell>
                  <TableCell>{booking.route?.name}</TableCell>
                  <TableCell>
                    {new Date(booking.travelDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{booking.schedule?.departureTime}</TableCell>
                  <TableCell>{booking.seatNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`status.${booking.status}`)}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>₹{booking.fare}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // View booking details
                          console.log('View booking:', booking);
                        }}
                      >
                        {t('bookingHistory.view')}
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          {t('bookingHistory.cancel')}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default BookingHistory;
