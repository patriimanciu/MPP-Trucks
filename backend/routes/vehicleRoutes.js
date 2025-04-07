import express from 'express';
import { vehicleData } from '../data/vehicles.js';

const router = express.Router();

router.get('/', (req, res) => {
    console.log('Fetching vehicle data');
  res.json(vehicleData);
});

export default router;