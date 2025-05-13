import express from 'express';
import * as Vehicle from '../models/Vehicle.js';

const router = express.Router();

// Complex statistics endpoint
router.get('/fleet/by-brand', async (req, res) => {
  try {
    const startTime = Date.now();
    const statistics = await Vehicle.getFleetStatisticsByBrand();
    const endTime = Date.now();
    
    res.json({
      executionTimeMs: endTime - startTime,
      statistics
    });
  } catch (error) {
    console.error('Error fetching fleet statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;