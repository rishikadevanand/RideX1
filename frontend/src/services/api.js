import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refresh: (refreshToken) => api.post('/auth/refresh', refreshToken),
  logout: (refreshToken) => api.post('/auth/logout', refreshToken),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Routes API
export const routesAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  getStats: () => api.get('/routes/stats/overview'),
};

// Schedules API
export const schedulesAPI = {
  getByRoute: (routeId, params) => api.get('/schedules', { params: { routeId, ...params } }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getAvailableSeats: (routeId, params) => api.get(`/schedules/route/${routeId}/available-seats`, { params }),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateLocation: (id, location) => api.put(`/vehicles/${id}/location`, location),
  updateMaintenance: (id, data) => api.put(`/vehicles/${id}/maintenance`, data),
  getStats: () => api.get('/vehicles/stats/overview'),
  getNeedingService: () => api.get('/vehicles/needing-service'),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  checkIn: (id) => api.put(`/bookings/${id}/check-in`),
  getStats: () => api.get('/bookings/stats/overview'),
};

// Forecast API
export const forecastAPI = {
  predict: (params) => api.get('/forecast/predict', { params }),
  getAnalytics: (routeId, params) => api.get(`/forecast/routes/${routeId}/analytics`, { params }),
  getTrends: (params) => api.get('/forecast/trends', { params }),
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getUserBookings: (id, params) => api.get(`/users/${id}/bookings`, { params }),
  getStats: () => api.get('/users/stats/overview'),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
  detailed: () => api.get('/health/detailed'),
};

export default api;