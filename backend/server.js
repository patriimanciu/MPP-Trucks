import express, { json } from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { WebSocketServer } from 'ws';
import https from 'https';
import fs from 'fs';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import statisticsRoutes from './routes/statisticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

// Import database connection
import { query } from './db.js';

// Import your models 
import MonitoredUser from './models/MonitoredUser.js';
import { startSecurityMonitor } from './securityMonitor.js';
import securityRoutes from './routes/securityRoutes.js';

// Load environment variables
dotenv.config();

console.log('ETHEREAL_USER:', process.env.ETHEREAL_USER);
console.log('ETHEREAL_PASS:', process.env.ETHEREAL_PASS);
console.log(process.env.DATABASE_URL);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const HTTPS_PORT = process.env.HTTPS_PORT || 5002;

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
};

// Initialize database tables
async function initApp() {
  // Wait for database connection to be established
  try {
    // Create the monitored user table
    await MonitoredUser.createTable();
    console.log('Monitored users table initialized');
    
    // Start the security monitoring service
    startSecurityMonitor();
    console.log('Security monitoring service started');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Setup middleware
app.use('/assets', express.static(path.join(__dirname, '../../frontend/public/assets')));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup routes
app.use('/api/videos', videoRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/security', securityRoutes);

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Initialize app and start servers
initApp()
  .then(() => {
    // Start HTTP server
    const httpServer = app.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTP Server is running on port ${PORT}`);
    });

    // Start HTTPS server
    const httpsServer = https.createServer(sslOptions, app);
    httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
      console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  });