import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import vehicleRoutes from '../../routes/vehicleRoutes.js';
import { vehicleData } from '../../data/vehicles.js';
import request from 'supertest';

const app = express();
app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);

describe('Vehicle Routes', () => {
  beforeEach(() => {
    vehicleData.length = 0;
    vehicleData.push(
      { id: 1, status: 'Active', location: 'Cluj-Napoca', capacity: 1000, year: 2020 },
      { id: 2, status: 'Inactive', location: 'Beclean', capacity: 500, year: 2018 },
      { id: 3, status: 'In Repair', location: 'Arad', capacity: 1500, year: 2022 },
      { id: 4, status: 'Active', location: 'Bucuresti', capacity: 800, year: 2019 }
    );
  });

  it('should fetch all vehicles', async () => {
    const response = await request(app).get('/api/vehicles');
    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(4);
    expect(response.body.total).toBe(4);
  });

  it('should filter vehicles by status', async () => {
    const response = await request(app).get('/api/vehicles?status=Active');
    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(2);
    expect(response.body.vehicles[0].status).toBe('Active');
  });

  it('should filter vehicles by location', async () => {
    const response = await request(app).get('/api/vehicles?location=Cluj-Napoca');
    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1);
    expect(response.body.vehicles[0].location).toBe('Cluj-Napoca');
  });

  it('should sort vehicles by capacity (high to low)', async () => {
    const response = await request(app).get('/api/vehicles?sort=high-low');
    expect(response.status).toBe(200);
    expect(response.body.vehicles[0].capacity).toBe(1500); 
    expect(response.body.vehicles[3].capacity).toBe(500);
  });

  it('should sort vehicles by year (newest first)', async () => {
    const response = await request(app).get('/api/vehicles?sort=new');
    expect(response.status).toBe(200);
    expect(response.body.vehicles[0].year).toBe(2022); 
    expect(response.body.vehicles[3].year).toBe(2018);
  });

  it('should paginate vehicles', async () => {
    const response = await request(app).get('/api/vehicles?page=1&limit=2');
    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(2); 
    expect(response.body.total).toBe(4); 
  });

  it('should filter, sort, and paginate vehicles', async () => {
    const response = await request(app).get('/api/vehicles?status=Active&sort=low-high&page=1&limit=1');
    expect(response.status).toBe(200);
    expect(response.body.vehicles).toHaveLength(1); 
    expect(response.body.vehicles[0].capacity).toBe(800);
  });
});