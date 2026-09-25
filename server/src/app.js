const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

// Middleware
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.PORTFOLIO_URL || 'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        (origin.includes('portfolio-frontend') && origin.endsWith('.vercel.app')) ||
        (origin.includes('portfolio-crm') && origin.endsWith('.vercel.app'))) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api', routes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API is running' });
});

// Error handling middleware could go here

module.exports = app;
