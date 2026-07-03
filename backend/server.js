const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

const app = express();

// ==========================
// Connect Database
// ==========================
connectDB();

// ==========================
// Create Upload & Backup Folders
// ==========================
const uploadDir = path.join(__dirname, 'uploads');
const backupDir = path.join(__dirname, 'backups');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// ==========================
// Middleware
// ==========================
app.use(helmet());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

// ==========================
// Static Files
// ==========================
app.use('/uploads', express.static(uploadDir));

// ==========================
// Routes
// ==========================
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const seedData = require('./scripts/seed');

// ==========================
// API Routes
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/super', superAdminRoutes);

// ==========================
// Root Route
// ==========================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart ATM Simulator Banking Server API Running'
  });
});

// ==========================
// TEMPORARY SEED ROUTE
// Remove this after database is seeded
// ==========================
app.get('/seed', async (req, res) => {
  try {

    const result = await seedData();

    res.status(200).json({
      success: true,
      message: 'Database Seeded Successfully',
      result
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

// ==========================
// Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server!'
  });
});

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Smart ATM Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});