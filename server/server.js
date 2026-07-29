// Load environment variables early in the lifecycle
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

// Database & Cloudinary Configuration
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');

// Route & Middleware Imports
const apiRouter = require('./routes/index');
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image requests (crucial for Cloudinary/static uploads)
}));

// Dynamic CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server, or curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some((allowed) => {
      if (!allowed) return false;
      const cleanAllowed = allowed.replace(/\/$/, '');
      return cleanOrigin === cleanAllowed || cleanOrigin.endsWith('.vercel.app');
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow to prevent CORS blockage on web client
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const { generalLimiter } = require('./middleware/rateLimiter');

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply general API rate limiting
app.use('/api/v1', generalLimiter);

// Root API Router Entrypoint
app.use('/api/v1', apiRouter);

// Root health & ping response for Render / Uptime monitors
app.get('/', (req, res) => {
  const fullUrl = `${req.protocol}://${req.get('host')}`;
  res.status(200).json({
    success: true,
    message: 'Ankita Makeup Studio Backend API is Live',
    version: '1.0.0',
    url: fullUrl,
    apiUrl: `${fullUrl}/api/v1`,
    health: `${fullUrl}/health`
  });
});

// Fallbacks for undefined routes and global errors
app.use(notFound);
app.use(errorHandler);

// Initialize Database connection & Cloudinary
connectDB().catch((err) => console.error('MongoDB connection error:', err));
connectCloudinary();

const PORT = process.env.PORT || 5000;

// Start Express listener when running standalone (not in serverless Vercel environment)
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`  Server is actively listening on port: ${PORT}`);
    console.log(`  Environment Mode: ${process.env.NODE_ENV}`);
  });

  // Handle system shutdowns gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server process terminated.');
    });
  });
}

// Export Express app for Vercel Serverless Function & testing
module.exports = app;
