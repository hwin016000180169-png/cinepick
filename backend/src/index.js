require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');
const watchlistRouter = require('./routes/watchlist');
const aiRouter = require('./routes/ai');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// ============================================
// Security Middleware
// ============================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI request limit exceeded, please wait.' }
});

app.use('/api/', limiter);
app.use('/api/ai', aiLimiter);

// ============================================
// General Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CinePick API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Routes
// ============================================
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/ai', aiRouter);

// ============================================
// 404 Handler
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`
  🎬 CinePick API Server
  ─────────────────────────
  🚀 Running on: http://localhost:${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  📅 Started: ${new Date().toLocaleString()}
  `);
});

module.exports = app;
