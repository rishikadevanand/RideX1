import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from '../App';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn()
  })
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  test('renders login page when user is not authenticated', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test('renders register link', () => {
    renderWithProviders(<App />);
    
    const registerLink = screen.getByText(/don't have an account/i);
    expect(registerLink).toBeInTheDocument();
  });
});
