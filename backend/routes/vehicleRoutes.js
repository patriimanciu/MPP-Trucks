import express from 'express';
import { vehicleData } from '../data/vehicles.js';

const router = express.Router();

// GET
router.get('/', (req, res) => {
  const { status, location, sortField = 'id', sortOrder = 'asc', page = 1, limit = 8 } = req.query;

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

  filteredVehicles.sort((a, b) => {
    if (sortOrder === 'desc') {
      return b[sortField] > a[sortField] ? 1 : -1;
    }
    return a[sortField] > b[sortField] ? 1 : -1;
  });

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  res.json({
    total: filteredVehicles.length,
    vehicles: paginatedVehicles,
  });
});

// Add a ping endpoint
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});
export default router;