const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase, isMySQL } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with secure HTTP-only cookies
app.use(
  session({
    name: 'bk.sid',
    secret: process.env.SESSION_SECRET || 'bk_royal_flame_grilled_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);

// Health & status check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Grill Thrill Food Ordering Platform API',
    database: isMySQL() ? 'MySQL (burger_king_db)' : 'In-Memory Store (Fallback)',
    timestamp: new Date().toISOString()
  });
});

// Mount REST API routes
app.use('/api/auth', authRoutes);
app.use('/api', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log('============================================================');
    console.log(`⚡ Grill Thrill Food Ordering Platform running at:`);
    console.log(`   👉 http://localhost:${PORT}`);
    console.log(`   👉 Menu API: http://localhost:${PORT}/api/menu`);
    console.log('============================================================');
  });
});
