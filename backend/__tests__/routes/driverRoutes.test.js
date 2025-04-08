import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import driverRoutes from '../../routes/driverRoutes.js';
import { driverData } from '../../data/drivers.js';
import request from 'supertest';

const app = express();
app.use(express.json());
app.use('/api/drivers', driverRoutes);

describe('Driver Routes', () => {
  beforeEach(() => {
    driverData.length = 0;
    driverData.push(
      { _id: 1, name: 'John', surname: 'Doe', phone: '0722345678', dateOfBirth: '1990-01-01', dateOfHiring: '2020-01-01', address: '123 Main St', assigned: 'Free' },
      { _id: 2, name: 'Jane', surname: 'Smith', phone: '0733456789', dateOfBirth: '1985-05-15', dateOfHiring: '2018-06-01', address: '456 Elm St', assigned: 'Assigned' }
    );
  });

  it('should fetch all drivers', async () => {
    const response = await request(app).get('/api/drivers');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe('John');
  });

  it('should create a new driver', async () => {
    const newDriver = {
      name: 'Alice',
      surname: 'Johnson',
      phone: '0745678910',
      dateOfBirth: '1992-03-10',
      dateOfHiring: '2021-07-01',
      address: '789 Oak St',
      assigned: 'Free',
    };

    const response = await request(app).post('/api/drivers').send(newDriver);
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Alice');
    expect(driverData).toHaveLength(3);
  });

  it('should update an existing driver', async () => {
    const updatedDriver = {
      name: 'John Updated',
      surname: 'Doe Updated',
      phone: '0722345678',
      dateOfBirth: '1990-01-01',
      dateOfHiring: '2020-01-01',
      address: '123 Main St Updated',
      assigned: 'Assigned',
    };
  
    const response = await request(app).put('/api/drivers/1').send(updatedDriver);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John Updated');
    expect(driverData[0].name).toBe('John Updated'); 
  });
  
  it('should return 404 if the driver to update is not found', async () => {
    const updatedDriver = {
      name: 'Nonexistent Driver',
      surname: 'Doe',
      phone: '0722345678',
      dateOfBirth: '1990-01-01',
      dateOfHiring: '2020-01-01',
      address: '123 Main St',
      assigned: 'Free',
    };
  
    const response = await request(app).put('/api/drivers/999').send(updatedDriver);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Driver not found');
  });

  it('should delete a driver', async () => {
    const response = await request(app).delete('/api/drivers/1');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('John'); 
    expect(driverData).toHaveLength(1);
  });
  
  it('should return 404 if the driver to delete is not found', async () => {
    const response = await request(app).delete('/api/drivers/999');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Driver not found');
  });
});