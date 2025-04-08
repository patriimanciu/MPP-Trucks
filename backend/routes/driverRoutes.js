import express from 'express';
import { driverData } from '../data/drivers.js';

const router = express.Router();

// GET
router.get('/', (req, res) => {
  res.json(driverData);
});

router.get('/:id', (req, res) => {
  const driverId = parseInt(req.params.id, 10);
  const driver = driverData.find((d) => d._id === driverId);

  if (!driver) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  res.json(driver);
});

// POST
router.post('/', (req, res) => {
  const newDriver = req.body;
  if (!newDriver.name || newDriver.name.length < 2) {
    return res.status(400).json({ message: 'Name is required and must be at least 2 characters long' });
  }
  if (!newDriver.surname || newDriver.surname.length < 2) {
    return res.status(400).json({ message: 'Surname is required and must be at least 2 characters long' });
  }
  if (!newDriver.phone || !/^\d{10}$/.test(newDriver.phone)) {
    return res.status(400).json({ message: 'A valid phone number is required (10 digits)' });
  }
  if (!newDriver.dateOfHiring || !/^\d{4}-\d{2}-\d{2}$/.test(newDriver.dateOfHiring)) {
    return res.status(400).json({ message: 'A valid hiring date is required (YYYY-MM-DD)' });
  }

  const newId = driverData.length > 0 ? Math.max(...driverData.map((d) => d._id)) + 1 : 1;
  const driverWithId = { ...newDriver, _id: newId };

  driverData.push(driverWithId);

  res.status(201).json(driverWithId);
});

// PUT
router.put('/:id', (req, res) => {
  const driverId = parseInt(req.params.id, 10);
  const updatedDriver = req.body;
  if (!updatedDriver.name || updatedDriver.name.length < 2) {
    return res.status(400).json({ message: 'Name is required and must be at least 2 characters long' });
  }
  if (!updatedDriver.surname || updatedDriver.surname.length < 2) {
    return res.status(400).json({ message: 'Surname is required and must be at least 2 characters long' });
  }
  if (!updatedDriver.phone || !/^\d{10}$/.test(updatedDriver.phone)) {
    return res.status(400).json({ message: 'A valid phone number is required (10 digits)' });
  }
  if (!updatedDriver.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(updatedDriver.dateOfBirth)) {
    return res.status(400).json({ message: 'A valid date of birth is required (YYYY-MM-DD)' });
  }
  if (!updatedDriver.dateOfHiring || !/^\d{4}-\d{2}-\d{2}$/.test(updatedDriver.dateOfHiring)) {
    return res.status(400).json({ message: 'A valid hiring date is required (YYYY-MM-DD)' });
  }

  const index = driverData.findIndex((driver) => driver._id === driverId);
  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }

  driverData[index] = { ...driverData[index], ...updatedDriver };

  res.json(driverData[index]);
});

// DELETE
router.delete('/:id', (req, res) => {
  const driverId = parseInt(req.params.id, 10);
  const index = driverData.findIndex((driver) => driver._id === driverId);
  if (index === -1) {
    return res.status(404).json({ message: 'Driver not found' });
  }
  const deletedDriver = driverData.splice(index, 1)[0];
  res.status(200).json(deletedDriver); 
});

export default router;