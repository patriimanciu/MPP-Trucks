import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DriversCollection from '../components/DriversCollection';
import { DriversContext } from '../context/DriversContext';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-chartjs-2', () => ({
  Pie: () => <div>Mocked Pie Chart</div>,
  Line: () => <div>Mocked Line Chart</div>,
}));

window.confirm = vi.fn();

describe('DriversCollection Component', () => {
  const renderComponent = (contextValue = {}) => {
    const defaultContextValue = {
      driverData: [
        { id: 1, name: 'John', surname: 'Doe', phone: '1234567890', dateOfHiring: '2023-01-01', assigned: 'Free' },
        { id: 2, name: 'Jane', surname: 'Smith', phone: '0987654321', dateOfHiring: '2023-02-01', assigned: 'Assigned' },
      ],
      setDrivers: vi.fn(),
      ...contextValue,
    };

    return render(
        <DriversContext.Provider value={defaultContextValue}>
          <DriversCollection onEdit={contextValue.onEdit} onAdd={contextValue.onAdd}/>
        </DriversContext.Provider>
      );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders DriversCollection without crashing', () => {
    renderComponent();

    expect(screen.getByText('Drivers')).toBeInTheDocument();
  });

  test('renders drivers table with correct data', () => {
    renderComponent();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('0987654321')).toBeInTheDocument();
  });

  test('calls onAdd when Add New Driver button is clicked', () => {
    const mockOnAdd = vi.fn();
    renderComponent({ onAdd: mockOnAdd });
  
    const addButton = screen.getByText('Add New Driver');
    fireEvent.click(addButton);
  
    expect(mockOnAdd).toHaveBeenCalledTimes(1); 
  });

  test('calls onEdit when Edit button is clicked', () => {
    const mockOnEdit = vi.fn(); 
    renderComponent({ onEdit: mockOnEdit }); 
  
    const editButtons = screen.getAllByText('Edit'); 
    fireEvent.click(editButtons[0]); 
  
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });

  test('deletes a driver when Delete button is clicked and confirmed', async () => {
    const setDriversMock = vi.fn();
    window.confirm.mockReturnValueOnce(true);

    renderComponent({ setDrivers: setDriversMock });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this driver?');
      expect(setDriversMock).toHaveBeenCalledWith([
        { id: 2, name: 'Jane', surname: 'Smith', phone: '0987654321', dateOfHiring: '2023-02-01', assigned: 'Assigned' },
      ]);
      expect(toast.success).toHaveBeenCalledWith('John Doe was deleted successfully');
    });
  });
});