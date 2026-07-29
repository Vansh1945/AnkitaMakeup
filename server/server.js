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

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
