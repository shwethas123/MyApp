import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/socket.js';
import { startAdoptionExpiryCron } from './src/jobs/adoptionExpiry.cron.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Init Socket.io + Redis
await initSocket(httpServer);

// Start adoption expiry cron
startAdoptionExpiryCron();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});