import express from 'express';
import * as Driver from '../models/Driver.js';
import { auth, authorize } from '../auth.js';
import { logActivity } from '../logger.js';
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

router.use(auth);
router.use(logActivity('driver'));
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
      driver.image_url ? [driver.image_url] : [],
    created_by: driver.created_by
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
    let drivers;
    if (req.userRole === 'admin') {
      drivers = await Driver.getAllDrivers();
    } else {
      drivers = await Driver.getDriversByUserId(req.userId);
    }
    
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

router.post('/', auth, async (req, res) => {
  try {
    console.log('Received driver data:', req.body);
    
    // Safe image handling - check if array exists AND has elements
    const hasImage = req.body.image && 
                    Array.isArray(req.body.image) && 
                    req.body.image.length > 0;
    
    const driverData = {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      date_of_birth: req.body.dateOfBirth,
      date_of_hiring: req.body.dateOfHiring,
      assigned_status: req.body.assigned,
      address: req.body.address,
      // Safely access image[0] only if it exists
      image_url: hasImage ? req.body.image[0] : null,
      created_by: req.body.created_by || req.userId
    };
    
    console.log('Processed driver data:', driverData);
    
    const driver = await Driver.createDriver(driverData);
    res.status(201).json(driver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: error.message || 'Failed to create driver' });
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