import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import VehicleItem from '../components/VehicleItem';
import { describe, test, expect } from 'vitest';

describe('VehicleItem Component', () => {
  const renderComponent = (props) => {
    return render(
      <BrowserRouter>
        <VehicleItem {...props} />
      </BrowserRouter>
    );
  };

  test('applies red border color when capacity is less than 1025', () => {
    renderComponent({
      plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      status: 'active',
      location: 'Garage A',
      assignedTo: 'John Doe',
      image: ['image1.jpg'],
      capacity: 1000,
      year: 2020,
    });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('border-red-500');
  });

  test('applies yellow border color when capacity is between 1025 and 1075', () => {
    renderComponent({
      plate: 'XYZ789',
      brand: 'Honda',
      model: 'Civic',
      status: 'maintenance',
      location: 'Garage B',
      assignedTo: 'Jane Smith',
      image: ['image2.jpg'],
      capacity: 1050,
      year: 2021,
    });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('border-yellow-500');
  });

  test('applies green border color when capacity is greater than 1075', () => {
    renderComponent({
      plate: 'LMN456',
      brand: 'Ford',
      model: 'Focus',
      status: 'inactive',
      location: 'Garage C',
      assignedTo: 'Alice Johnson',
      image: ['image3.jpg'],
      capacity: 1100,
      year: 2022,
    });

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('border-green-500');
  });
});