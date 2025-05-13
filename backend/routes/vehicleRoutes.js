import express from 'express';
import * as Vehicle from '../models/Vehicle.js';

const router = express.Router();

function transformVehicleForFrontend(vehicle) {
  return {
    _id: vehicle.id,
    plate: vehicle.plate,
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    status: vehicle.status,
    assignedTo: vehicle.assigned_to_name || 'Unavailable', 
    location: vehicle.location,
    lastUpdate: vehicle.last_update,
    capacity: vehicle.capacity,
    fuel: vehicle.fuel,
    mileage: vehicle.mileage,
    maintenance: vehicle.maintenance,
    insurance: vehicle.insurance,
    best: vehicle.best,
    image: vehicle.image_url ? [vehicle.image_url] : []
  };
}

router.get('/', async (req, res) => {
  try {
    const { sortBy = 'id', sortOrder = 'asc' } = req.query;
    const statusValues = Array.isArray(req.query.status) ? req.query.status : 
                    req.query.status ? [req.query.status] : [];

    
    const locationValues = Array.isArray(req.query.location) ? req.query.location : 
                           req.query.location ? [req.query.location] : [];
    
    console.log('Status filters:', statusValues);
    console.log('Location filters:', locationValues);
    
    const filters = {};
    
    if (statusValues.length > 0) {
      filters.status = statusValues;
    }
    
    if (locationValues.length > 0) {
      filters.location = locationValues;
    }
    
    const vehicles = await Vehicle.getAllVehicles(sortBy, sortOrder, filters);
    const transformedVehicles = vehicles.map(transformVehicleForFrontend);
    
    res.json(transformedVehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.getVehicleById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const transformedVehicle = transformVehicleForFrontend(vehicle);
    
    res.json(transformedVehicle);
  } catch (error) {
    console.error('Error getting vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new vehicle
router.post('/', async (req, res) => {
  try {
    const newVehicle = await Vehicle.createVehicle(req.body);
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.updateVehicle(req.params.id, req.body);
    
    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.deleteVehicle(req.params.id);
    
    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(deletedVehicle);
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add this to your vehicleRoutes.js file
router.get('/:id/drivers', async (req, res) => {
  try {
    const vehicleId = parseInt(req.params.id, 10);
    
    if (isNaN(vehicleId)) {
      return res.status(400).json({ error: 'Invalid vehicle ID' });
    }
    
    const drivers = await Vehicle.getVehicleDrivers(vehicleId);
    
    // Transform to frontend format
    const transformedDrivers = drivers.map(driver => ({
      _id: driver.id,
      name: driver.name,
      surname: driver.surname,
      phone: driver.phone,
      dateOfBirth: driver.date_of_birth ? new Date(driver.date_of_birth).toISOString().split('T')[0] : '',
      dateOfHiring: driver.date_of_hiring ? new Date(driver.date_of_hiring).toISOString().split('T')[0] : '',
      assigned: driver.assigned_status,
      salary: driver.salary,
      address: driver.address,
      image: driver.image_url ? [driver.image_url] : [],
      isPrimary: driver.is_primary,
      assignedDate: driver.assigned_date ? new Date(driver.assigned_date).toISOString().split('T')[0] : ''
    }));
    
    res.json(transformedDrivers);
  } catch (error) {
    console.error('Error fetching vehicle drivers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;