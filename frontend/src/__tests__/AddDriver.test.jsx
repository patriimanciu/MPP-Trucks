import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DriversContext } from '../context/DriversContext';
import AddDriver from '../pages/AddDriver';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AddDriver Component', () => {
  const mockSetDrivers = vi.fn();

  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom'); 
    return {
      ...actual,
      useNavigate: () => vi.fn(),
    };
  });

  const renderComponent = (contextValue = {}) => {
    const defaultContextValue = {
      driverData: [],
      setDrivers: mockSetDrivers,
      ...contextValue,
    };
  
    return render(
      <BrowserRouter>
        <DriversContext.Provider value={defaultContextValue}>
          <AddDriver />
        </DriversContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders AddDriver component correctly', () => {
    renderComponent();

    expect(screen.getByText('Add New Driver')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Address')).toBeInTheDocument();
    expect(screen.getByText('Add Driver')).toBeInTheDocument();
  });

  test('shows validation errors for required fields', async () => {
    renderComponent();

    const addButton = screen.getByText('Add Driver');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required (min 2 characters)')).toBeInTheDocument();
      expect(screen.getByText('Surname is required (min 2 characters)')).toBeInTheDocument();
      expect(screen.getByText('Valid phone number is required (10 digits)')).toBeInTheDocument();
    });
  });
});