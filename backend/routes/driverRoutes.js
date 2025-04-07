import express from 'express';
import { driverData } from '../data/drivers.js';

const router = express.Router();
router.get('/', (req, res) => {
  res.json(driverData);
});

export default router;