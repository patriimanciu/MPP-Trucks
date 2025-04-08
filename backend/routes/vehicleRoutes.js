import express from 'express';
import { vehicleData } from '../data/vehicles.js';

const router = express.Router();

// GET
router.get('/', (req, res) => {
  const { status, location, sort, page = 1, limit = 10 } = req.query;

  let filteredVehicles = [...vehicleData];

  if (status) {
    const statusArray = status.split(',');
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      statusArray.includes(vehicle.status)
    );
  }

  if (location) {
    const locationArray = location.split(','); 
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      locationArray.includes(vehicle.location)
    );
  }

  if (sort) {
    switch (sort) {
      case 'high-low':
        filteredVehicles.sort((a, b) => b.capacity - a.capacity);
        break;
      case 'low-high':
        filteredVehicles.sort((a, b) => a.capacity - b.capacity);
        break;
      case 'new':
        filteredVehicles.sort((a, b) => b.year - a.year);
        break;
      case 'old':
        filteredVehicles.sort((a, b) => a.year - b.year);
        break;
      default:
        break;
    }
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
  
  res.json({
    total: filteredVehicles.length,
    vehicles: paginatedVehicles,
  });
});

export default router;