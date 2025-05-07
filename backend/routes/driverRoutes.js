import express from 'express';
import * as Driver from '../models/Driver.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/assets/people/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });
const router = express.Router();
function transformDriverForFrontend(driver) {
  return {
    _id: driver.id,
    name: driver.name,
    surname: driver.surname,
    phone: driver.phone,
    dateOfBirth: driver.date_of_birth ? 
      new Date(driver.date_of_birth).toISOString().split('T')[0] : '',
    dateOfHiring: driver.date_of_hiring ? 
      new Date(driver.date_of_hiring).toISOString().split('T')[0] : '',
    assigned: driver.assigned_status,
    salary: driver.salary,
    address: driver.address,
    image: Array.isArray(driver.image_url) ? 
      driver.image_url : 
      driver.image_url ? [driver.image_url] : []
  };
}

function transformDriverForDatabase(driver) {
  return {
    name: driver.name,
    surname: driver.surname,
    phone: driver.phone,
    date_of_birth: driver.dateOfBirth,
    date_of_hiring: driver.dateOfHiring,
    assigned_status: driver.assigned,
    salary: driver.salary,
    address: driver.address,
    image_url: Array.isArray(driver.image) ? driver.image[0] : driver.image,
  };
}

// Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.getAllDrivers();
    const transformedDrivers = drivers.map(transformDriverForFrontend);
    res.json(transformedDrivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific driver
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.getDriverById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(transformDriverForFrontend(driver));
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const driverData = req.body;
    console.log('Raw driver data from frontend:', driverData);
    
    let formattedBirthDate = null;
    if (driverData.dateOfBirth) {
      formattedBirthDate = driverData.dateOfBirth;
      console.log('Formatted birth date:', formattedBirthDate);
    }
    
    let formattedHiringDate = null;
    if (driverData.dateOfHiring) {
      formattedHiringDate = driverData.dateOfHiring;
      console.log('Formatted hiring date:', formattedHiringDate);
    }
    
    const dbDriver = {
      name: driverData.name,
      surname: driverData.surname,
      phone: driverData.phone,
      date_of_birth: formattedBirthDate,
      date_of_hiring: formattedHiringDate,
      assigned_status: driverData.assigned || 'Free',
      salary: driverData.salary || '',
      address: driverData.address || '',
      image_url: Array.isArray(driverData.image) && driverData.image.length > 0 
        ? driverData.image[0] 
        : null
    };
    
    console.log('Prepared driver data for database:', dbDriver);
    
    const createdDriver = await Driver.createDriver(dbDriver);
    
    const responseData = transformDriverForFrontend(createdDriver);
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: error.message || 'Error creating driver' });
  }
});

// Update a driver
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid driver ID' });
    }
    
    console.log('Incoming data from frontend:', req.body);
    
    const driverData = {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      dateOfHiring: req.body.dateOfHiring,
      assigned: req.body.assigned,
      salary: req.body.salary,
      address: req.body.address,
      image: req.body.image
    };
    
    const updatedDriver = await Driver.updateDriver(id, driverData);
    
    const responseData = {
      _id: updatedDriver.id,
      name: updatedDriver.name,
      surname: updatedDriver.surname,
      phone: updatedDriver.phone,
      dateOfBirth: updatedDriver.date_of_birth ? 
        new Date(updatedDriver.date_of_birth).toISOString().split('T')[0] : '',
      dateOfHiring: updatedDriver.date_of_hiring ? 
        new Date(updatedDriver.date_of_hiring).toISOString().split('T')[0] : '',
      assigned: updatedDriver.assigned_status,
      salary: updatedDriver.salary,
      address: updatedDriver.address,
      image: updatedDriver.image_url ? [updatedDriver.image_url] : []
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a driver
router.delete('/:id', async (req, res) => {
  try {
    const deletedDriver = await Driver.deleteDriver(req.params.id);
    
    if (!deletedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(transformDriverForFrontend(deletedDriver));
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;