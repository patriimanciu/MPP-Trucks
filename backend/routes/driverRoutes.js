import express from 'express';
import { driverData } from '../data/drivers.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

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

const validateDriver = (driver) => {
  if (!driver.name || driver.name.length < 2) {
    return 'Name is required and must be at least 2 characters long';
  }
  if (!driver.surname || driver.surname.length < 2) {
    return 'Surname is required and must be at least 2 characters long';
  }
  if (!driver.phone || !/^\d{10}$/.test(driver.phone)) {
    return 'A valid phone number is required (10 digits)';
  }
  if (!driver.dateOfHiring || !/^\d{4}-\d{2}-\d{2}$/.test(driver.dateOfHiring)) {
    return 'A valid hiring date is required (YYYY-MM-DD)';
  }
  return null; // No errors
};

const createDriver = (req, res) => {
  try {
    console.log('Incoming request body:', req.body);

    const { name, surname, phone, dateOfHiring, assigned } = req.body;

    if (!name || !surname || !phone || !dateOfHiring || !assigned) {
      console.log('Validation failed:', { name, surname, phone, dateOfHiring, assigned });
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newId = driverData.length > 0 ? Math.max(...driverData.map((d) => d._id)) + 1 : 1;
    const newDriver = { _id: newId, name, surname, phone, dateOfHiring, assigned };

    driverData.push(newDriver);

    console.log('Driver added to memory:', newDriver);
    res.status(201).json(newDriver);
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ message: 'Failed to create driver' });
  }
};

router.post('/', createDriver);

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('Incoming file:', req.file);
    console.log('Incoming driver data:', req.body.driver);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newDriver = JSON.parse(req.body.driver);

    const validationError = validateDriver(newDriver);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const filePath = req.file.path;

    const newId = driverData.length > 0 ? Math.max(...driverData.map((d) => d._id)) + 1 : 1;
    const driverWithID = { 
      ...newDriver, 
      _id: newId, 
      image: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` 
    };
    console.log('New driver with ID:', driverWithID);

    driverData.push(driverWithID);

    console.log('Updated driverData array:', driverData);

    res.status(201).json(driverWithID);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// PUT
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const driverId = parseInt(req.params.id, 10);
    console.log(`Updating driver with ID: ${driverId}`);
    console.log('Incoming request body:', req.body);
    console.log('Incoming file:', req.file);

    const driver = driverData.find((d) => d._id === driverId);
    if (!driver) {
      console.log(`Driver with ID ${driverId} not found`);
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (!req.body.driver) {
      console.log('No driver data provided in the request body');
      return res.status(400).json({ message: 'Driver data is required' });
    }

    let updatedDriver;
    try {
      updatedDriver = JSON.parse(req.body.driver);
    } catch (parseError) {
      console.log('Failed to parse driver data:', parseError);
      return res.status(400).json({ message: 'Invalid driver data format' });
    }

    const validationError = validateDriver(updatedDriver);
    if (validationError) {
      console.log('Validation failed:', validationError);
      return res.status(400).json({ message: validationError });
    }

    if (req.file) {
      updatedDriver.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    Object.assign(driver, updatedDriver);

    console.log('Updated driver:', driver);
    res.status(200).json(driver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ message: 'Failed to update driver' });
  }
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

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

export default router;