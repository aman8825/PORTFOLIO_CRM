require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);

// Setup scheduled tasks
const cron = require('node-cron');
const { performBackup } = require('./services/backupService');

// Run automated backup every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily automated backup...');
  try {
    await performBackup();
  } catch (err) {
    console.error('Scheduled backup failed:', err);
  }
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
