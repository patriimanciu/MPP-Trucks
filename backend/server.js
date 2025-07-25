import express, { json } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import videoRoutes from './routes/videoRoutes.js'

const app = express();
const PORT = process.env.PORT || 5001;

app.use('/assets', express.static(path.join(__dirname, '../../frontend/public/assets')));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/videos', videoRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});


const broadcast = (data) => {
  try {
    const serializedData = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(serializedData);
      }
    });
  } catch (error) {
    console.error('Error broadcasting data:', error);
  }
};

const driverData = [];

setInterval(() => {
  try {
    const newDriver = {
      _id: Date.now(),
      name: `Driver ${Math.floor(Math.random() * 100)}`,
      surname: `Surname ${Math.floor(Math.random() * 100)}`,
      phone: `1234567890`,
      dateOfHiring: new Date().toISOString().split('T')[0],
      assigned: ['Free', 'Assigned', 'On Leave'][Math.floor(Math.random() * 3)],
    };

    if (!newDriver.name || !newDriver.surname || !newDriver.phone) {
      throw new Error('Invalid driver data');
    }

    driverData.push(newDriver);
    console.log('New driver generated:', newDriver);

    broadcast({ type: 'NEW_DRIVER', payload: newDriver });
  } catch (error) {
    console.error('Error generating new driver:', error);
  }
}, 10000);