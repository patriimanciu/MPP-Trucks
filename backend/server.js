import express, { json } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use('/assets', express.static(path.join(__dirname, '../../frontend/public/assets')));

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});